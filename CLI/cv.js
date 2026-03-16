#!/usr/bin/env node
/**
 * cv — CodeVision CLI
 *
 * Usage:
 *   cv init <slug>              Create project folder structure
 *   cv fetch <slug> [--full]    Print paths for AI context loading
 *   cv status [<slug>]          Print current project state
 *   cv lint [<slug>]            Validate structure and gate conditions
 *
 * All artifacts live at ~/.codevision/projects/<slug>/
 *
 * To install globally:
 *   chmod +x cv.js
 *   npm link   (from this directory)
 * Or run directly:
 *   node cv.js init my-project
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, cpSync } from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';
import { MIGRATIONS, migrateProject, semverLt } from './cv-migrate.js';
import { join } from 'path';
import { homedir } from 'os';
import { cmdStories } from './cv-stories.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const CV_ROOT = join(homedir(), '.codevision');
const PROJECTS_DIR = join(CV_ROOT, 'projects');
const CV_VERSION = '2.2.0';
const CV_GITHUB_REPO = 'your-username/codevision'; // UPDATE this after creating the repo
const CV_GITHUB_RAW = `https://raw.githubusercontent.com/${CV_GITHUB_REPO}/main`;
const CV_VERSION_FILE = join(CV_ROOT, 'version');

const FOLDER_STRUCTURE = [
  'chronicles',
  'features',
  'specs',
  'tasks',
  'ledger',
  'components',
  'variables',
  'stakeholders',
  'contracts',
];

// Seeded empty files that must exist for other commands
const SEED_FILES = [
  { path: 'ledger/decisions.md',   content: '# Decision Ledger\n\n<!-- Entries written by /cv.* commands -->\n' },
  { path: 'ledger/changes.md',     content: '# Change Log\n\n<!-- Entries written by /cv.change -->\n' },
  { path: 'components/registry.md',content: '# Component Registry\n\n<!-- Entries written by /cv.component -->\n' },
];

// ─── Version tracking ────────────────────────────────────────────────────────

function getInstalledVersion() {
  if (existsSync(CV_VERSION_FILE)) {
    return readFileSync(CV_VERSION_FILE, 'utf8').trim();
  }
  // If no version file exists, assume it's a pre-migration install
  return '2.1.1';
}

function setInstalledVersion(v) {
  writeFileSync(CV_VERSION_FILE, v);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function projectDir(slug) {
  return join(PROJECTS_DIR, slug);
}

function slugValid(slug) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

function bold(str)  { return `\x1b[1m${str}\x1b[0m`; }
function green(str) { return `\x1b[32m${str}\x1b[0m`; }
function red(str)   { return `\x1b[31m${str}\x1b[0m`; }
function dim(str)   { return `\x1b[2m${str}\x1b[0m`; }
function yellow(str){ return `\x1b[33m${str}\x1b[0m`; }

function ok(msg)   { console.log(`  ${green('✓')} ${msg}`); }
function fail(msg) { console.log(`  ${red('✗')} ${msg}`); }
function info(msg) { console.log(`  ${dim('·')} ${msg}`); }
function warn(msg) { console.log(`  ${yellow('!')} ${msg}`); }

function die(msg) {
  console.error(`\n${red('Error:')} ${msg}\n`);
  process.exit(1);
}

function isoNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/**
 * cv init <slug>
 *
 * Creates the full project folder structure and seed files.
 * Idempotent — safe to run on an existing project (skips existing paths).
 */
function cmdInit(args) {
  const slug = args[0];

  if (!slug) {
    die('Usage: cv init <slug>\n  Example: cv init aiko-health');
  }

  if (!slugValid(slug)) {
    die(
      `"${slug}" is not a valid slug.\n` +
      '  Slugs must be lowercase letters, numbers, and hyphens only.\n' +
      '  Examples: aiko-health, cosplans, my-app'
    );
  }

  const dir = projectDir(slug);
  const isNew = !existsSync(dir);

  console.log(`\n${bold('CodeVision')} ${dim(`v${CV_VERSION}`)}\n`);

  if (!isNew) {
    warn(`Project "${slug}" already exists at ${dim(dir)}`);
    warn('Running in idempotent mode — creating any missing paths.\n');
  } else {
    console.log(`${bold('Initializing')} ${green(slug)}\n`);
  }

  // Create root if needed
  mkdirSync(PROJECTS_DIR, { recursive: true });

  // Create all subdirectories
  for (const folder of FOLDER_STRUCTURE) {
    const target = join(dir, folder);
    if (!existsSync(target)) {
      mkdirSync(target, { recursive: true });
      ok(folder + '/');
    } else {
      info(folder + '/  (exists)');
    }
  }

  // Create seed files
  console.log('');
  for (const { path: relPath, content } of SEED_FILES) {
    const target = join(dir, relPath);
    if (!existsSync(target)) {
      writeFileSync(target, content, 'utf8');
      ok(relPath);
    } else {
      info(`${relPath}  (exists)`);
    }
  }

  // Write a minimal status.toon if it doesn't exist
  const statusPath = join(dir, 'status.toon');
  if (!existsSync(statusPath)) {
    const statusContent = [
      `project: ${slug}`,
      `phase: discovery`,
      `active_feature_id: null`,
      `paused: false`,
      `created_at: ${isoNow()}`,
      `codevision_version: ${CV_VERSION}`,
    ].join('\n') + '\n';
    writeFileSync(statusPath, statusContent, 'utf8');
    ok('status.toon');
  } else {
    info('status.toon  (exists)');
  }

  // Print next step
  console.log(`
${bold('Done.')} Project structure created at:
${dim(dir)}

${bold('Next step:')} Open your AI assistant and run:

  ${green('/cv.init')}

This will define your project mission and configuration.
`);
}

/**
 * cv fetch <slug> [--full]
 *
 * Prints the artifact paths that should be loaded into AI context.
 * Default: phase-aware (only relevant artifacts for current phase).
 * --full: all artifacts.
 *
 * Output is intended to be piped into an AI context loader or copied
 * into a Cursor/Claude project context configuration.
 */
function cmdFetch(args) {
  const slug = args.find(a => !a.startsWith('--'));
  const full = args.includes('--full');

  if (!slug) die('Usage: cv fetch <slug> [--full]');

  const dir = projectDir(slug);
  if (!existsSync(dir)) {
    die(`Project "${slug}" not found.\n  Run: cv init ${slug}`);
  }

  // Read current phase from status.toon
  const statusPath = join(dir, 'status.toon');
  let phase = 'discovery';
  if (existsSync(statusPath)) {
    const lines = readFileSync(statusPath, 'utf8').split('\n');
    const phaseLine = lines.find(l => l.startsWith('phase:'));
    if (phaseLine) phase = phaseLine.split(':')[1].trim();
  }

  // Phase → relevant artifacts
  const PHASE_ARTIFACTS = {
    discovery:   ['mission.md', 'status.toon', 'chronicles/'],
    planning:    ['mission.md', 'status.toon', 'chronicles/', 'features/'],
    clarify:     ['mission.md', 'status.toon', 'features/', 'chronicles/'],
    design:      ['mission.md', 'status.toon', 'features/', 'specs/'],
    engineering: ['mission.md', 'status.toon', 'features/', 'specs/', 'tasks/'],
    review:      ['mission.md', 'status.toon', 'features/', 'specs/', 'tasks/', 'ledger/'],
    done:        ['mission.md', 'status.toon', 'ledger/'],
  };

  const ALL_ARTIFACTS = [
    'mission.md', 'status.toon', 'config.toon',
    'chronicles/', 'features/', 'specs/', 'tasks/',
    'ledger/', 'components/', 'variables/', 'contracts/',
  ];

  const artifacts = full ? ALL_ARTIFACTS : (PHASE_ARTIFACTS[phase] || ALL_ARTIFACTS);

  console.log(`\n${bold('cv fetch')} ${green(slug)} ${full ? '(full)' : `(phase: ${phase})`}\n`);
  console.log('Artifacts to load into AI context:\n');

  for (const artifact of artifacts) {
    const fullPath = join(dir, artifact);
    if (existsSync(fullPath)) {
      console.log(`  ${green('✓')} ${fullPath}`);
    } else {
      console.log(`  ${dim('·')} ${fullPath}  ${dim('(not yet created)')}`);
    }
  }

  console.log(`\n${dim('Tip: Pass these paths to your AI context loader, or copy into Cursor / Claude project context.')}\n`);
}

/**
 * cv status [<slug>]
 *
 * Prints the current state of a project without invoking AI.
 */
function cmdStatus(args) {
  const slug = args[0];

  if (!slug) {
    // List all projects
    if (!existsSync(PROJECTS_DIR)) {
      console.log('\nNo projects found. Run: cv init <slug>\n');
      return;
    }
    const projects = readdirSync(PROJECTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    if (!projects.length) {
      console.log('\nNo projects found. Run: cv init <slug>\n');
      return;
    }

    console.log(`\n${bold('CodeVision Projects')}\n`);
    for (const p of projects) {
      const statusPath = join(PROJECTS_DIR, p, 'status.toon');
      let phase = 'unknown';
      if (existsSync(statusPath)) {
        const lines = readFileSync(statusPath, 'utf8').split('\n');
        const pl = lines.find(l => l.startsWith('phase:'));
        if (pl) phase = pl.split(':')[1].trim();
      }
      console.log(`  ${green(p)}  ${dim(phase)}`);
    }
    console.log('');
    return;
  }

  const dir = projectDir(slug);
  if (!existsSync(dir)) die(`Project "${slug}" not found.`);

  const statusPath = join(dir, 'status.toon');
  if (!existsSync(statusPath)) die(`status.toon not found in ${dir}`);

  console.log(`\n${bold('Status')} — ${green(slug)}\n`);
  const lines = readFileSync(statusPath, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    const val = rest.join(':').trim();
    if (val && val !== 'null') {
      console.log(`  ${bold(key.trim().padEnd(22))} ${val}`);
    }
  }
  console.log('');
}

/**
 * cv lint [<slug>]
 *
 * Validates folder structure and gate conditions.
 * Exits with code 1 if any blocking issues are found.
 */
function cmdLint(args) {
  const slug = args[0];
  if (!slug) die('Usage: cv lint <slug>');

  const dir = projectDir(slug);
  if (!existsSync(dir)) die(`Project "${slug}" not found.\n  Run: cv init ${slug}`);

  console.log(`\n${bold('cv lint')} — ${green(slug)}\n`);

  let errors = 0;
  let warnings = 0;

  // Check required root files
  const required = ['mission.md', 'status.toon'];
  for (const f of required) {
    const p = join(dir, f);
    if (existsSync(p)) {
      ok(f);
    } else {
      fail(`${f}  ${red('MISSING — required before any command')}`);
      errors++;
    }
  }

  // Check required folders
  for (const folder of FOLDER_STRUCTURE) {
    const p = join(dir, folder);
    if (!existsSync(p)) {
      warn(`${folder}/  ${yellow('missing')}`);
      warnings++;
    }
  }

  // Check features and their gate conditions
  const featuresDir = join(dir, 'features');
  if (existsSync(featuresDir)) {
    const feats = readdirSync(featuresDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    if (feats.length > 0) {
      console.log(`\n${bold('Feature Gates')}\n`);
      for (const feat of feats) {
        const featDir = join(featuresDir, feat);
        const approvalsPath = join(featDir, 'approvals.toon');

        let approvals = {};
        if (existsSync(approvalsPath)) {
          // Parse simple toon: "prd\n  status: approved"
          const raw = readFileSync(approvalsPath, 'utf8');
          let current = null;
          for (const line of raw.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            if (!line.startsWith(' ') && !line.startsWith('\t')) {
              current = trimmed.replace(':', '');
              approvals[current] = {};
            } else if (current && trimmed.startsWith('status:')) {
              approvals[current].status = trimmed.split(':')[1].trim();
            }
          }
        }

        const getStatus = (key) => approvals[key]?.status ?? 'missing';
        const prdStatus = getStatus('prd');
        const erdStatus = getStatus('erd');
        const specStatus = getStatus('spec');

        const statusIcon = (s) => s === 'approved' ? green('approved') : s === 'pending' ? yellow('pending') : s === 'missing' ? dim('—') : dim(s);

        console.log(`  ${bold(feat)}`);
        console.log(`    prd    ${statusIcon(prdStatus)}`);
        console.log(`    erd    ${statusIcon(erdStatus)}${prdStatus !== 'approved' ? dim('  (blocked: prd not approved)') : ''}`);
        console.log(`    spec   ${statusIcon(specStatus)}${(prdStatus !== 'approved' || erdStatus !== 'approved') ? dim('  (blocked: prd + erd required)') : ''}`);

        if (prdStatus !== 'approved' && existsSync(join(featDir, 'prd.md'))) {
          warn(`${feat}: prd.md exists but is not approved`);
          warnings++;
        }
      }
    }
  }

  // Summary
  console.log('');
  if (errors === 0 && warnings === 0) {
    console.log(`${green('All checks passed.')}\n`);
  } else {
    if (errors > 0) console.log(`${red(`${errors} error(s) found — blocking.`)}`);
    if (warnings > 0) console.log(`${yellow(`${warnings} warning(s) found.`)}`);
    console.log('');
  }

  if (errors > 0) process.exit(1);
}

// ─── cmd: upgrade ────────────────────────────────────────────────────────────

async function cmdUpgrade(args) {
  const checkOnly  = args.includes('--check');
  const migrateOnly = args.includes('--migrate');
  const force      = args.includes('--force');

  const execAsync = promisify(exec);

  console.log(`\n${bold('CodeVision Upgrade')}\n`);

  // ── Step 1: Check latest version on GitHub ───────────────────────────────
  const installedVersion = getInstalledVersion();
  console.log(`Installed version : ${bold(`v${installedVersion}`)}`);
  process.stdout.write('Checking GitHub   : ');

  let latestVersion;
  try {
    const versionUrl = `${CV_GITHUB_RAW}/VERSION`;
    latestVersion = await new Promise((resolve, reject) => {
      https.get(versionUrl, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} fetching VERSION from GitHub`));
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data.trim()));
      }).on('error', reject);
    });
    console.log(bold(`v${latestVersion}`));
  } catch (err) {
    console.log(red('failed'));
    die(`Could not reach GitHub: ${err.message}\n\nCheck that CV_GITHUB_REPO is set correctly in cv.js (currently: ${CV_GITHUB_REPO})`);
  }

  const needsUpgrade = semverLt(installedVersion, latestVersion);

  if (!needsUpgrade && !force && !migrateOnly) {
    console.log(`\n${green('Already up to date.')}\n`);
    // Still run migrations in case the version file is newer than the project folders
    await cmdMigrate(['--silent']);
    return;
  }

  if (checkOnly) {
    if (needsUpgrade) {
      console.log(`\n${yellow(`Update available: v${installedVersion} → v${latestVersion}`)}`);
      console.log(`Run ${bold('cv upgrade')} to install.\n`);
    }
    return;
  }

  if (migrateOnly) {
    await cmdMigrate([]);
    return;
  }

  // ── Step 2: Download updated files ──────────────────────────────────────
  console.log(`\n${bold('Downloading v' + latestVersion + '...')}`);

  const FILES_TO_UPDATE = [
    { remote: 'cli/cv.js',          local: join(CV_ROOT, 'cli', 'cv.js') },
    { remote: 'cli/cv-stories.js',  local: join(CV_ROOT, 'cli', 'cv-stories.js') },
    { remote: 'cli/cv-migrate.js',  local: join(CV_ROOT, 'cli', 'cv-migrate.js') },
    { remote: 'cli/package.json',   local: join(CV_ROOT, 'cli', 'package.json') },
    { remote: 'commands/_core.md',       local: join(CV_ROOT, 'commands', '_core.md') },
    { remote: 'commands/cv.init.md',     local: join(CV_ROOT, 'commands', 'cv.init.md') },
    { remote: 'commands/cv.chronicle.md',local: join(CV_ROOT, 'commands', 'cv.chronicle.md') },
    { remote: 'commands/cv.clarify.md',  local: join(CV_ROOT, 'commands', 'cv.clarify.md') },
    { remote: 'commands/cv.persona.md',  local: join(CV_ROOT, 'commands', 'cv.persona.md') },
    { remote: 'commands/cv.product.md',  local: join(CV_ROOT, 'commands', 'cv.product.md') },
  ];

  // Ensure CLI and commands dirs exist
  mkdirSync(join(CV_ROOT, 'cli'), { recursive: true });
  mkdirSync(join(CV_ROOT, 'commands'), { recursive: true });

  let downloadErrors = 0;
  for (const file of FILES_TO_UPDATE) {
    process.stdout.write(`  ${file.remote.padEnd(36)} `);
    try {
      await new Promise((resolve, reject) => {
        const url = `${CV_GITHUB_RAW}/${file.remote}`;
        https.get(url, res => {
          if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
          const out = createWriteStream(file.local);
          res.pipe(out);
          out.on('finish', resolve);
          out.on('error', reject);
        }).on('error', reject);
      });
      console.log(green('✓'));
    } catch (err) {
      console.log(red(`✗ ${err.message}`));
      downloadErrors++;
    }
  }

  if (downloadErrors > 0) {
    console.log(`\n${red(`${downloadErrors} file(s) failed to download.`)} The upgrade may be incomplete.`);
    console.log(`Run ${bold('cv upgrade --force')} to retry, or download manually from github.com/${CV_GITHUB_REPO}\n`);
    process.exit(1);
  }

  // ── Step 3: Run migrations ───────────────────────────────────────────────
  console.log('');
  await cmdMigrate(['--from', installedVersion, '--to', latestVersion]);

  // ── Step 4: Record new version ───────────────────────────────────────────
  setInstalledVersion(latestVersion);
  console.log(`\n${green(`✓ CodeVision upgraded to v${latestVersion}`)}`);
  console.log(`\n${bold('Next step:')} re-run ${bold('npm link')} from ~/.codevision/cli/ to update the global cv command.`);
  console.log(`  cd ~/.codevision/cli && npm link\n`);
}

// ─── cmd: migrate ─────────────────────────────────────────────────────────────

async function cmdMigrate(args) {
  const silent   = args.includes('--silent');
  const fromIdx  = args.indexOf('--from');
  const toIdx    = args.indexOf('--to');
  const fromVer  = fromIdx >= 0 ? args[fromIdx + 1] : getInstalledVersion();
  const toVer    = toIdx   >= 0 ? args[toIdx   + 1] : CV_VERSION;

  const log  = silent ? () => {} : (msg) => console.log(msg);
  const warn = (msg) => console.log(yellow(msg));

  if (!existsSync(PROJECTS_DIR)) {
    log('No projects found — nothing to migrate.');
    return;
  }

  const projects = readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  if (projects.length === 0) {
    log('No projects found — nothing to migrate.');
    return;
  }

  if (!silent) {
    console.log(`${bold('Running migrations')} (v${fromVer} → v${toVer})\n`);
  }

  let anyMigrated = false;
  for (const slug of projects) {
    const dir = projectDir(slug);
    // Read project-level version if it exists; fall back to installed version
    const projVersionPath = join(dir, '.cv-version');
    const projVersion = existsSync(projVersionPath)
      ? readFileSync(projVersionPath, 'utf8').trim()
      : fromVer;

    const pending = MIGRATIONS.filter(m =>
      semverLt(projVersion, m.version) && !semverLt(toVer, m.version)
    );

    if (pending.length === 0) {
      log(`  ${bold(slug)} — up to date`);
      continue;
    }

    anyMigrated = true;
    log(`  ${bold(slug)} — applying ${pending.length} migration(s)`);
    const ok = migrateProject(dir, projVersion, toVer, { log, warn });

    if (ok) {
      // Record the new version in the project folder
      writeFileSync(projVersionPath, toVer);
      log(`  ${green('✓')} ${slug} → v${toVer}`);
    } else {
      warn(`  ${red('✗')} ${slug} — migration had errors, see above`);
    }
    log('');
  }

  if (!anyMigrated && !silent) {
    console.log(`${green('All projects are up to date.')}\n`);
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

const [,, command, ...rest] = process.argv;

const COMMANDS = {
  init:    cmdInit,
  fetch:   cmdFetch,
  status:  cmdStatus,
  lint:    cmdLint,
  stories: cmdStories,
  upgrade: cmdUpgrade,
  migrate: cmdMigrate,
};

if (!command || command === '--help' || command === '-h') {
  console.log(`
${bold('cv')} — CodeVision CLI v${CV_VERSION}

${bold('Usage:')}
  cv init <slug>              Create project folder structure
  cv fetch <slug> [--full]    Show artifacts to load into AI context
  cv status [<slug>]          Print project state
  cv lint <slug>              Validate structure and gate conditions
  cv stories <slug> <source>  Parse a story document into CHR files
                              source: .md .txt .docx or Google Docs URL
                              --interactive  Full Q&A per story before writing
  cv upgrade                  Upgrade CLI and commands from GitHub
  cv upgrade --check          Check if an update is available
  cv upgrade --migrate        Run project migrations only (no file downloads)
  cv migrate                  Run pending migrations on all local projects

${bold('Examples:')}
  cv init aiko-health
  cv fetch aiko-health
  cv fetch aiko-health --full
  cv lint aiko-health

${bold('Artifact store:')} ~/.codevision/projects/
`);
  process.exit(0);
}

const handler = COMMANDS[command];
if (!handler) {
  die(`Unknown command: "${command}"\nRun cv --help for usage.`);
}

handler(rest);
