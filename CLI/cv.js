#!/usr/bin/env node
/**
 * cv — CodeVision CLI v3.0.0
 *
 * Usage:
 *   cv init [name]              Interactive setup wizard
 *   cv fetch <slug> [--full]    Print paths for AI context loading
 *   cv status [<slug>]          Print current project state
 *   cv lint <slug>              Validate structure and gate conditions
 *   cv stories <slug> <source>  Parse story document into CHR files
 *   cv ask [--multi] <q> <opts> Present a multiple-choice question in the terminal
 *   cv upgrade                  Upgrade CLI and commands from GitHub
 *   cv migrate                  Run pending project migrations
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync, createWriteStream } from 'fs';
import { input, checkbox, select } from '@inquirer/prompts';
import https from 'https';
import { MIGRATIONS, migrateProject, semverLt } from './cv-migrate.js';
import { join } from 'path';
import { homedir } from 'os';
import { cmdStories } from './cv-stories.js';
import { cmdAsk } from './cv-prompt.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const CV_HOME        = join(homedir(), '.codevision');
const CV_SYSTEM_PROJECTS = join(CV_HOME, 'projects');
const CV_COMMANDS    = join(CV_HOME, 'commands');
const CV_CLI_DIR     = join(CV_HOME, 'cli');
const CV_LIB_DIR     = join(CV_HOME, 'lib');
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CV_VERSION_FILE = join(CV_HOME, 'version');

let CV_VERSION = '3.0.0'; // fallback
try {
  // If running from repo, read the package.json file
  const pkgInfo = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
  if (pkgInfo.version) CV_VERSION = pkgInfo.version;
} catch (e) {
  try {
    // If installed globally, read the downloaded version string
    CV_VERSION = readFileSync(CV_VERSION_FILE, 'utf8').trim();
  } catch (e2) { /* ignore */ }
}
const CV_GITHUB_REPO = 'Thaumonaut/CodeVision-CLI';
const CV_GITHUB_RAW  = `https://raw.githubusercontent.com/${CV_GITHUB_REPO}/refs/heads/main`;
const CV_GITHUB_API  = `https://api.github.com/repos/${CV_GITHUB_REPO}/contents`;
const REPO_CLI_DIR   = 'CLI';
const REPO_CMDS_DIR  = 'commands';

// Subfolder name used inside each tool's rules/commands directory
const CV_SUBFOLDER = 'codevision';

const ARTIFACT_FOLDERS = [
  'personas', 'chronicles', 'features', 'adrs',
  'components', 'contracts', 'ledger',
];

// ─── AI Tool targets ─────────────────────────────────────────────────────────
//
// type: 'subdir' → copy all .md files into destDir/codevision/
//       'append' → concatenate a CV block into a single file
//
// Command files are always sourced from ~/.codevision/commands/ (downloaded by
// cv upgrade). The install step copies them into the appropriate project path.

const WIZARD_TARGETS = [
  {
    value: 'antigravity',
    name: 'Antigravity',
    type: 'subdir',
    destDir: '.agents/commands/codevision',
  },
  {
    value: 'claude-code',
    name: 'Claude Code',
    type: 'subdir',
    destDir: '.claude/commands/codevision',
  },
  {
    value: 'cursor',
    name: 'Cursor',
    type: 'subdir',
    destDir: '.cursor/rules/codevision',
  },
  {
    value: 'windsurf',
    name: 'Windsurf',
    type: 'subdir',
    destDir: '.windsurf/rules/codevision',
  },
  {
    value: 'roocode',
    name: 'RooCode',
    type: 'subdir',
    destDir: '.roo/rules/codevision',
  },
  {
    value: 'kilocode',
    name: 'KiloCode',
    type: 'subdir',
    destDir: '.kilocode/rules/codevision',
  },
  {
    value: 'copilot',
    name: 'GitHub Copilot',
    type: 'append',
    destFile: '.github/copilot-instructions.md',
  },
  {
    value: 'codex',
    name: 'ChatGPT Codex',
    type: 'append',
    destFile: 'AGENTS.md',
  },
];

// ─── Version tracking ─────────────────────────────────────────────────────────

function getInstalledVersion() {
  return existsSync(CV_VERSION_FILE) ? readFileSync(CV_VERSION_FILE, 'utf8').trim() : '2.2.2';
}
function setInstalledVersion(v) { writeFileSync(CV_VERSION_FILE, v); }

// ─── Colour / output helpers ──────────────────────────────────────────────────

function bold(s)   { return `\x1b[1m${s}\x1b[0m`; }
function green(s)  { return `\x1b[32m${s}\x1b[0m`; }
function red(s)    { return `\x1b[31m${s}\x1b[0m`; }
function dim(s)    { return `\x1b[2m${s}\x1b[0m`; }
function yellow(s) { return `\x1b[33m${s}\x1b[0m`; }
function cyan(s)   { return `\x1b[36m${s}\x1b[0m`; }
function ok(m)     { console.log('  ' + green('✓') + ' ' + m); }
function fail(m)   { console.log('  ' + red('✗') + ' ' + m); }
function info(m)   { console.log('  ' + dim('·') + ' ' + m); }
function warn(m)   { console.log('  ' + yellow('!') + ' ' + m); }
function die(m)    { console.error('\n' + red('Error:') + ' ' + m + '\n'); process.exit(1); }
function isoNow()  { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }
function section(title) {
  console.log('');
  console.log(bold(title));
  console.log(dim('─'.repeat(42)));
}

// ─── Slug helpers ──────────────────────────────────────────────────────────────

function nameToSlug(name) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '') || null;
}
function randomSlug() {
  return Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
}
function slugValid(slug) { return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug); }

// ─── config.toon helpers ──────────────────────────────────────────────────────

/**
 * Serialise a flat object to a minimal TOON-compatible format.
 * Values are always strings; null becomes empty.
 */
function toToon(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v == null ? '' : String(v)}`)
    .join('\n') + '\n';
}

/**
 * Parse a simple flat TOON/key-value file.
 */
function parseToon(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf(':');
    if (idx < 0) continue;
    out[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
  return out;
}

function readConfigToon(path) {
  if (!existsSync(path)) return null;
  try { return parseToon(readFileSync(path, 'utf8')); } catch { return null; }
}

function readConfigJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

function readProjectStatus(root) {
  const jsonPath = join(root, 'status.json');
  if (existsSync(jsonPath)) {
    try { return JSON.parse(readFileSync(jsonPath, 'utf8')); } catch { return null; }
  }
  const toonPath = join(root, 'status.toon');
  if (existsSync(toonPath)) {
    try { return parseToon(readFileSync(toonPath, 'utf8')); } catch { return null; }
  }
  return null;
}

// ─── Artifact root resolution ─────────────────────────────────────────────────

/**
 * Find the artifact root for a project.
 *
 * Search order:
 *   1. <cwd>/.cv/config.toon   → project mode (store_mode: project)
 *   2. ~/.codevision/projects/<slug>/  → system mode (store_mode: system)
 *
 * Returns { root, slug, config } or throws via die().
 */
function resolveArtifactRoot(slugHint, cwd = process.cwd()) {
  // 1. Check project-local first (config.json v3, then config.toon v2 fallback)
  const localConfigJson = join(cwd, '.cv', 'config.json');
  const localConfigToon = join(cwd, '.cv', 'config.toon');
  const localCfg = readConfigJson(localConfigJson) || readConfigToon(localConfigToon);
  if (localCfg && (!slugHint || localCfg.project === slugHint)) {
    return { root: join(cwd, '.cv'), slug: localCfg.project, config: localCfg };
  }

  // 2. System mode — require slug
  if (slugHint) {
    const sysRoot = join(CV_SYSTEM_PROJECTS, slugHint);
    if (existsSync(sysRoot)) {
      const cfg = readConfigJson(join(sysRoot, 'config.json')) ||
                  readConfigToon(join(sysRoot, 'config.toon')) ||
                  { project: slugHint, store_mode: 'system' };
      return { root: sysRoot, slug: slugHint, config: cfg };
    }
  }

  // 3. If no slug given, scan system projects registry
  if (!slugHint && existsSync(CV_SYSTEM_PROJECTS)) {
    const dirs = readdirSync(CV_SYSTEM_PROJECTS, { withFileTypes: true })
      .filter(d => d.isDirectory()).map(d => d.name);
    if (dirs.length === 1) {
      const slug = dirs[0];
      const cfg  = readConfigJson(join(CV_SYSTEM_PROJECTS, slug, 'config.json')) ||
                   readConfigToon(join(CV_SYSTEM_PROJECTS, slug, 'config.toon')) ||
                   { project: slug, store_mode: 'system' };
      return { root: join(CV_SYSTEM_PROJECTS, slug), slug, config: cfg };
    }
  }

  if (slugHint) {
    die(`Project "${slugHint}" not found.\nRun ${bold('cv status')} to list known projects.`);
  } else {
    die(`No CodeVision project found in ${cwd}.\nRun ${bold('cv init')} to create one, or pass a slug: ${bold('cv status <slug>')}`);
  }
}

// ─── File installation helpers ────────────────────────────────────────────────

function installFiles(src, dest, { force = false } = {}) {
  if (!existsSync(src)) return { installed: 0, skipped: 0 };
  mkdirSync(dest, { recursive: true });
  const files = readdirSync(src).filter(f => f.endsWith('.md'));
  let installed = 0, skipped = 0;
  for (const file of files) {
    const d = join(dest, file);
    if (existsSync(d) && !force) { skipped++; continue; }
    copyFileSync(join(src, file), d);
    installed++;
  }
  return { installed, skipped };
}

function buildCvBlock(slug) {
  return [
    '',
    '<!-- CodeVision: BEGIN (managed by cv init) -->',
    '## CodeVision Workflow',
    '',
    `This project uses CodeVision for spec-driven development. Project slug: \`${slug}\``,
    '',
    '### Command sequence',
    '`/cv.init` → `/cv.persona` → `/cv.chronicle` → `/cv.define` → `/cv.spec` → `/cv.tasks` → `/cv.build`',
    '',
    '<!-- CodeVision: END -->',
    '',
  ].join('\n');
}

// ─── cmd: init ────────────────────────────────────────────────────────────────

async function cmdInit(args) {
  const force  = args.includes('--force');
  const nonFlag = args.filter(a => !a.startsWith('--'));
  const cwd    = process.cwd();

  console.log('');
  console.log(bold('╔══════════════════════════════════════╗'));
  console.log(bold('║       CodeVision Setup Wizard        ║') + ' ' + dim('v' + CV_VERSION));
  console.log(bold('╚══════════════════════════════════════╝'));
  console.log('');

  // Ensure command files exist locally before the wizard starts
  if (!existsSync(CV_COMMANDS)) {
    console.log(yellow('  Command files not found locally. Fetching from GitHub first...'));
    console.log('');
    await cmdUpgrade([]);
    console.log('');
  }

  // ── Step 1: Project name ──────────────────────────────────────────────────

  section('Step 1 of 5 — Project name');
  console.log('');

  let slug = nonFlag[0] && slugValid(nonFlag[0]) ? nonFlag[0] : null;
  let projectName = slug || '';

  if (!slug) {
    projectName = await input({
      message: 'Project name:',
      default: 'my-project',
      validate: v => v.trim().length > 0 || 'Please enter a name',
    });
    const generated = nameToSlug(projectName) || randomSlug();
    slug = await input({
      message: 'Slug (folder name / identifier):',
      default: generated,
      validate: v => slugValid(v.trim()) || 'Lowercase letters, numbers, and hyphens only',
      transformer: v => v.toLowerCase().replace(/\s+/g, '-'),
    });
    slug = slug.trim();
  }

  console.log('');
  console.log('  ' + green('✓') + ' Project: ' + bold(projectName) + ' ' + dim('(' + slug + ')'));

  // ── Step 2: Author name ───────────────────────────────────────────────────

  section('Step 2 of 5 — Your name');
  console.log('');
  console.log(dim('  Used as the author in ledger entries and approvals.'));
  console.log('');

  const authorName = await input({
    message: 'Your name or display name:',
    validate: v => v.trim().length > 0 || 'Please enter a name',
  });

  console.log('');
  console.log('  ' + green('✓') + ' Author: ' + bold(authorName.trim()));

  // ── Step 3: Artifact store location ──────────────────────────────────────

  section('Step 3 of 5 — Artifact storage');
  console.log('');
  console.log(dim('  Where should CodeVision store your project artifacts?'));
  console.log('');

  const storeChoice = await select({
    message: 'Storage location:',
    choices: [
      {
        name: 'This project  ' + dim('(portable — .cv/ inside your repo, commit it to git)'),
        value: 'project',
        short: 'Project (.cv/)',
      },
      {
        name: 'My system     ' + dim('(global — ~/.codevision/projects/<slug>/, stays outside repo)'),
        value: 'system',
        short: 'System (~/.codevision/)',
      },
    ],
  });

  const storeMode  = storeChoice; // 'project' | 'system'
  const artifactRoot = storeMode === 'project'
    ? join(cwd, '.cv')
    : join(CV_SYSTEM_PROJECTS, slug);

  console.log('');
  if (storeMode === 'project') {
    ok('Artifacts → ' + cyan(join(cwd, '.cv') + '/'));
  } else {
    ok('Artifacts → ' + cyan(join(CV_SYSTEM_PROJECTS, slug) + '/'));
  }

  // ── Step 3: AI tool selection ─────────────────────────────────────────────

  section('Step 4 of 5 — AI tool(s)');
  console.log('');
  console.log(dim('  Select which AI tool(s) you use. Commands will be installed into'));
  console.log(dim('  the correct folder for each tool (inside your current project directory).'));
  console.log('');

  const selected = await checkbox({
    message: 'AI tool(s): (↑↓ navigate, Space select, Enter confirm)',
    choices: WIZARD_TARGETS.map(t => ({
      name: t.name,
      value: t.value,
      checked: t.value === 'claude-code',
    })),
    instructions: false,
    validate: () => true,
  });

  const targets = WIZARD_TARGETS.filter(t => selected.includes(t.value));

  // ── Step 4a: Create artifact folder structure ─────────────────────────────

  section('Step 5 of 5 — Creating project structure');
  console.log('');

  if (existsSync(artifactRoot)) {
    console.log(yellow('  Directory already exists — adding missing items only.'));
    console.log('');
  }

  mkdirSync(artifactRoot, { recursive: true });
  const rootLabel = storeMode === 'project' ? '.cv' : `~/.codevision/projects/${slug}`;

  for (const f of ARTIFACT_FOLDERS) {
    const t = join(artifactRoot, f);
    if (!existsSync(t)) { mkdirSync(t); ok(rootLabel + '/' + f + '/'); }
    else { info(rootLabel + '/' + f + '/  (exists)'); }
  }
  console.log('');

  // Seed initial files
  const now = isoNow();
  const seeds = [
    {
      p: 'mission.md',
      c: `# Mission — ${projectName}\n<!-- Populated by /cv.init (AI command). -->\n\n## North Star\n[TBD]\n\n## Problem Statement\n[TBD]\n\n## Target Users\n[TBD]\n\n## Success Signal\n[TBD]\n\n## Non-Goals\n[TBD]\n`,
    },
    {
      p: 'constitution.md',
      c: `# Constitution — ${projectName}\n<!-- Populated by /cv.init (AI command). -->\n<!-- Read by: Validation Agent (build/run commands), all AI commands (stack + non-negotiables) -->\n\n## Project Type\n[TBD]\n\n## Tech Stack\n[TBD]\n\n## Build & Run\n[TBD]\n\n## Design System\n[TBD]\n\n## Non-Negotiables\n[TBD]\n`,
    },
    {
      p: 'ledger/ledger.md',
      c: `# Decision Ledger\n\n[PE-001] Project initialized: ${slug}\n  date:   ${now.slice(0, 10)}\n  source: cli\n  actor:  ${authorName.trim()}\n  status: decided\n  tags:   []\n  note:   Mode: ${storeMode}.\n`,
    },
    { p: 'components/registry.md', c: '# Component Registry\n' },
  ];

  for (const { p, c } of seeds) {
    const t = join(artifactRoot, p);
    if (!existsSync(t)) { writeFileSync(t, c, 'utf8'); ok(rootLabel + '/' + p); }
    else { info(rootLabel + '/' + p + '  (exists)'); }
  }

  // Write status.json
  const statusJson = {
    state: 'active',
    phase: 'explore',
    active_feature: null,
    validation_blocked: false,
    last_command: 'cv init',
    last_updated: now,
  };
  const statusJsonPath = join(artifactRoot, 'status.json');
  if (!existsSync(statusJsonPath)) {
    writeFileSync(statusJsonPath, JSON.stringify(statusJson, null, 2) + '\n');
    ok(rootLabel + '/status.json');
  } else { info(rootLabel + '/status.json  (exists)'); }

  // Write config.json — always overwrite so it reflects current choices
  const configJson = {
    project: slug,
    name: projectName,
    author: authorName.trim(),
    store_mode: storeMode,
    tools: targets.map(t => t.value),
    cwd,
    codevision_version: CV_VERSION,
    created_at: now,
  };
  writeFileSync(join(artifactRoot, 'config.json'), JSON.stringify(configJson, null, 2) + '\n');
  ok(rootLabel + '/config.json');

  // Register in global index (always, regardless of store mode, so cv status works)
  mkdirSync(CV_HOME, { recursive: true });
  const registryPath = join(CV_HOME, 'registry.toon');
  let registry = {};
  if (existsSync(registryPath)) {
    try { registry = parseToon(readFileSync(registryPath, 'utf8')); } catch { /* ignore */ }
  }
  registry[slug] = JSON.stringify({ cwd, store_mode: storeMode, artifact_root: artifactRoot, version: CV_VERSION });
  writeFileSync(registryPath, Object.entries(registry).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n');

  console.log('');

  // ── Step 4b: Install command files into AI tool directories ───────────────

  if (!targets.length) {
    info('No AI tool selected — skipping command installation.');
    info('Run ' + bold('cv init --force') + ' to install commands later.');
    console.log('');
  } else {
    console.log(bold('  Installing commands:'));
    console.log('');

    for (const t of targets) {
      console.log('  ' + bold(t.name));

      if (t.type === 'subdir') {
        // All tools get files from the unified commands/ dir into their own subfolder
        const dest = join(cwd, t.destDir);
        const { installed, skipped } = installFiles(CV_COMMANDS, dest, { force });
        if (installed) ok(installed + ' files → ' + t.destDir + '/');
        if (skipped)   info(skipped + ' skipped (use --force to overwrite)');
        if (!installed && !skipped) warn('No command files found in ' + CV_COMMANDS + ' — run cv upgrade');
      }

      if (t.type === 'append') {
        const dst = join(cwd, t.destFile);
        const MARK_START = '<!-- CodeVision: BEGIN';
        const MARK_END   = '<!-- CodeVision: END -->';
        const block = buildCvBlock(slug);
        let ex = existsSync(dst) ? readFileSync(dst, 'utf8') : '';
        if (ex.includes(MARK_START)) {
          if (force) {
            const s = ex.indexOf(MARK_START);
            const e = ex.indexOf(MARK_END) + MARK_END.length;
            writeFileSync(dst, ex.slice(0, s) + block.trimStart() + ex.slice(e + 1));
            ok('Updated CV block in ' + t.destFile);
          } else {
            info('CV block already in ' + t.destFile + ' (use --force to replace)');
          }
        } else {
          if (t.destFile.includes('/')) {
            mkdirSync(join(cwd, t.destFile.split('/').slice(0, -1).join('/')), { recursive: true });
          }
          writeFileSync(dst, ex + (ex.endsWith('\n') ? '' : '\n') + block);
          ok('Appended CV block to ' + t.destFile);
        }
      }

      console.log('');
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(bold(green('✓ CodeVision is ready.')));
  console.log('');
  console.log('  Project  : ' + bold(projectName) + ' ' + dim('(' + slug + ')'));
  console.log('  Author   : ' + bold(authorName.trim()));
  console.log('  Artifacts: ' + cyan(artifactRoot + '/'));
  console.log('  Mode     : ' + (storeMode === 'project'
    ? green('project') + dim(' (.cv/ in repo)')
    : green('system')  + dim(' (~/.codevision/projects/' + slug + '/)')));
  console.log('');
  console.log(bold('Next steps:'));
  console.log('');
  console.log('  1. ' + cyan('/cv.init') + '        ' + dim('Define mission + tech constitution (run inside your AI tool)'));
  console.log('  2. ' + cyan('/cv.persona') + '     ' + dim('Build your first user persona'));
  console.log('  3. ' + cyan('/cv.chronicle') + '   ' + dim('Write the first user journey'));
  console.log('');
  console.log(dim('  Tip: run ') + bold('cv fetch ' + slug) + dim(' to load artifacts into AI context'));
  console.log('');
}

// ─── Command reinstall helper ────────────────────────────────────────────────
//
// Used by both cmdInit (first install) and cmdUpgrade (refresh).
// Reads installed tools from config.toon and copies updated files from
// ~/.codevision/commands/ into each tool's destination folder.

function reinstallCommandsForProject(config, projectCwd, { force = true } = {}) {
  const toolValues = Array.isArray(config.tools)
    ? config.tools
    : (config.tools || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!toolValues.length) return;

  const targets = WIZARD_TARGETS.filter(t => toolValues.includes(t.value));
  let total = 0;

  for (const t of targets) {
    if (t.type === 'subdir') {
      const dest = join(projectCwd, t.destDir);
      const { installed } = installFiles(CV_COMMANDS, dest, { force });
      if (installed) {
        ok(`${t.name}: ${installed} file(s) → ${t.destDir}/`);
        total += installed;
      }
    }
    // append-type tools (Copilot, Codex) are not re-written on upgrade
    // to avoid clobbering user content in those files
  }
  return total;
}

// ─── cmd: fetch ───────────────────────────────────────────────────────────────

function cmdFetch(args) {
  const slugHint = args.find(a => !a.startsWith('--'));
  const full     = args.includes('--full');

  const { root, slug, config } = resolveArtifactRoot(slugHint);

  let phase = 'explore';
  const s = readProjectStatus(root);
  if (s) phase = s.phase || s.current_phase || phase;

  const PHASE_ARTIFACTS = {
    explore:  ['mission.md', 'constitution.md', 'status.json', 'personas/', 'chronicles/'],
    define:   ['mission.md', 'constitution.md', 'status.json', 'chronicles/', 'features/'],
    specify:  ['mission.md', 'status.json', 'features/'],
    task:     ['mission.md', 'status.json', 'features/'],
    build:    ['mission.md', 'constitution.md', 'status.json', 'features/', 'contracts/'],
    triage:   ['mission.md', 'status.json', 'features/'],
    prove:    ['mission.md', 'status.json', 'features/', 'ledger/'],
  };
  const ALL = [
    'mission.md', 'constitution.md', 'status.json',
    'personas/', 'chronicles/', 'features/', 'adrs/', 'ledger/', 'components/', 'contracts/',
  ];
  const arts = full ? ALL : (PHASE_ARTIFACTS[phase] || ALL);

  console.log('\n' + bold('cv fetch') + ' ' + green(slug) + ' ' + (full ? '(full)' : '(phase: ' + phase + ')'));
  console.log(dim('Artifact root: ' + root) + '\n');

  for (const a of arts) {
    const fp = join(root, a);
    if (existsSync(fp)) console.log('  ' + green('✓') + ' ' + fp);
    else console.log('  ' + dim('·') + ' ' + fp + '  ' + dim('(not created yet)'));
  }
  console.log('\n' + dim('Tip: Pass these paths to your AI context loader.') + '\n');
}

// ─── cmd: status ──────────────────────────────────────────────────────────────

function cmdStatus(args) {
  const slugHint = args.find(a => !a.startsWith('--'));
  const cwd = process.cwd();

  // No slug — try to detect locally, then show all system projects
  if (!slugHint) {
    const localConfig = join(cwd, '.cv', 'config.toon');
    if (existsSync(localConfig)) {
      const cfg = readConfigToon(localConfig);
      if (cfg) return _printProjectStatus(join(cwd, '.cv'), cfg.project, cfg);
    }

    // Show all system projects
    const allProjects = _listAllProjects();
    if (!allProjects.length) {
      console.log('\nNo CodeVision projects found. Run: ' + bold('cv init') + '\n');
      return;
    }
    console.log('\n' + bold('CodeVision Projects') + '\n');
    for (const { slug, root, config } of allProjects) {
      const phase = config?.current_phase || 'unknown';
      const name  = config?.name || slug;
      const mode  = config?.store_mode || '?';
      console.log(
        '  ' + cyan(slug.padEnd(24)) +
        bold(name.padEnd(28)) +
        dim(phase.padEnd(18)) +
        dim('(' + mode + ')')
      );
    }
    console.log('');
    return;
  }

  const { root, slug, config } = resolveArtifactRoot(slugHint);
  _printProjectStatus(root, slug, config);
}

function _printProjectStatus(root, slug, config) {
  const s = readProjectStatus(root);
  if (!s) die('No status.json found in ' + root + '\nRun /cv.init inside your AI tool to initialize the project state.');

  console.log('\n' + bold('Status') + ' — ' + cyan(slug) + '\n');

  if (s.validation_blocked) {
    console.log('  ' + red('⛔ VALIDATION BLOCKED') + ' — ' + (s.active_feature || 'unknown feature'));
    console.log('  ' + dim('No build work can proceed. Run /cv.debug to resolve.'));
    console.log('');
  }

  const display = {
    phase:              s.phase || s.current_phase,
    active_feature:     s.active_feature || s.active_feature_id || '—',
    validation_blocked: s.validation_blocked ?? false,
    last_command:       s.last_command || '—',
    last_updated:       s.last_updated || '—',
  };
  for (const [k, v] of Object.entries(display)) {
    console.log('  ' + bold(String(k).padEnd(24)) + ' ' + String(v));
  }
  if (config?.store_mode) {
    console.log('  ' + bold('store_mode'.padEnd(24)) + ' ' + config.store_mode);
    console.log('  ' + bold('artifact_root'.padEnd(24)) + ' ' + root);
  }
  console.log('');
}

function _listAllProjects() {
  const projects = [];
  // 1. Local project in cwd (config.json v3, config.toon v2 fallback)
  const cwd = process.cwd();
  const localCfg = readConfigJson(join(cwd, '.cv', 'config.json')) ||
                   readConfigToon(join(cwd, '.cv', 'config.toon'));
  if (localCfg) projects.push({ slug: localCfg.project, root: join(cwd, '.cv'), config: localCfg });

  // 2. System projects
  if (existsSync(CV_SYSTEM_PROJECTS)) {
    for (const d of readdirSync(CV_SYSTEM_PROJECTS, { withFileTypes: true }).filter(d => d.isDirectory())) {
      const root = join(CV_SYSTEM_PROJECTS, d.name);
      const cfg  = readConfigJson(join(root, 'config.json')) ||
                   readConfigToon(join(root, 'config.toon'));
      if (!projects.find(p => p.slug === d.name)) {
        projects.push({ slug: d.name, root, config: cfg });
      }
    }
  }
  return projects;
}

// ─── cmd: lint ────────────────────────────────────────────────────────────────

function cmdLint(args) {
  const slugHint = args.find(a => !a.startsWith('--'));
  const { root, slug } = resolveArtifactRoot(slugHint);

  console.log('\n' + bold('cv lint') + ' — ' + cyan(slug) + '\n');
  let errors = 0, warnings = 0;

  // Core file checks
  for (const f of ['mission.md', 'status.json', 'constitution.md', 'config.json']) {
    if (existsSync(join(root, f))) ok(f);
    else { fail(f + '  ' + red('MISSING')); errors++; }
  }

  // Check for validation block
  const s = readProjectStatus(root);
  if (s?.validation_blocked) {
    fail('validation_blocked: true — ' + red('BLOCKED'));
    errors++;
  }
  // Folder checks
  for (const f of ARTIFACT_FOLDERS) {
    if (!existsSync(join(root, f))) { warn(f + '/  ' + yellow('missing')); warnings++; }
  }

  // Feature directory check
  const featDir = join(root, 'features');
  if (existsSync(featDir)) {
    const feats = readdirSync(featDir, { withFileTypes: true })
      .filter(d => d.isDirectory()).map(d => d.name);
    if (feats.length) {
      console.log('\n' + bold('Features') + '\n');
      for (const feat of feats) {
        const briefPath = join(featDir, feat, '.brief');
        const hasBrief  = existsSync(briefPath);
        console.log('  ' + bold(feat) + (hasBrief ? '' : dim('  (no .brief)')));
        if (!hasBrief) { warn(feat + ': .brief missing — run /cv.define'); warnings++; }
      }
    }
  }

  console.log('');
  if (!errors && !warnings) { console.log(green('All checks passed.') + '\n'); }
  else {
    if (errors)   console.log(red(errors + ' error(s) found — blocking.'));
    if (warnings) console.log(yellow(warnings + ' warning(s) found.'));
    console.log('');
  }
  if (errors > 0) process.exit(1);
}

// ─── cmd: upgrade ─────────────────────────────────────────────────────────────
//
// Downloads CLI files and the unified commands/ folder from GitHub.
// Command files are stored in ~/.codevision/commands/ and then copied
// into each project's AI tool directories by cv init.

async function cmdUpgrade(args) {
  const checkOnly   = args.includes('--check');
  const migrateOnly = args.includes('--migrate');
  const force       = args.includes('--force');

  console.log('\n' + bold('CodeVision Upgrade') + '\n');
  const installedVersion = getInstalledVersion();
  console.log('Installed : ' + bold('v' + installedVersion));
  process.stdout.write('GitHub    : ');

  let latestVersion;
  try {
    const pkgUrl = `${CV_GITHUB_API}/${REPO_CLI_DIR}/package.json?t=${Date.now()}`;
    const pkgRaw = await fetchText(pkgUrl, { headers: { Accept: 'application/vnd.github.v3.raw' } });
    const pkgInfo = JSON.parse(pkgRaw);
    latestVersion = pkgInfo.version;
    console.log(bold('v' + latestVersion));
  } catch (err) {
    console.log(red('failed'));
    die('Could not reach GitHub: ' + err.message + '\n\nCheck CV_GITHUB_REPO in cv.js (currently: ' + CV_GITHUB_REPO + ')');
  }

  const needsUpgrade = semverLt(installedVersion, latestVersion);
  if (!needsUpgrade && !force && !migrateOnly) {
    console.log('\n' + green('Already up to date.') + '\n');
    await cmdMigrate(['--silent']);
    return;
  }
  if (checkOnly) {
    if (needsUpgrade) {
      console.log('\n' + yellow('Update available: v' + installedVersion + ' → v' + latestVersion));
      console.log('Run ' + bold('cv upgrade') + ' to install.\n');
    }
    return;
  }
  if (migrateOnly) { await cmdMigrate([]); return; }

  console.log('\n' + bold('Downloading v' + latestVersion + '...') + '\n');

  // ── Static CLI files ──────────────────────────────────────────────────────
  const STATIC_FILES = [
    { r: `${REPO_CLI_DIR}/cv.js`,         l: join(CV_CLI_DIR, 'cv.js') },
    { r: `${REPO_CLI_DIR}/cv-stories.js`, l: join(CV_LIB_DIR, 'cv-stories.js') },
    { r: `${REPO_CLI_DIR}/cv-migrate.js`, l: join(CV_LIB_DIR, 'cv-migrate.js') },
    { r: `${REPO_CLI_DIR}/package.json`,  l: join(CV_CLI_DIR, 'package.json') },
  ];

  for (const d of [CV_CLI_DIR, CV_LIB_DIR, CV_COMMANDS]) {
    mkdirSync(d, { recursive: true });
  }

  let errs = 0;
  for (const f of STATIC_FILES) {
    process.stdout.write('  ' + f.r.padEnd(40) + ' ');
    try {
      await downloadFile(CV_GITHUB_RAW + '/' + f.r, f.l);
      console.log(green('✓'));
    } catch (err) { console.log(red('✗ ' + err.message)); errs++; }
  }

  // ── Dynamic command files (enumerate from GitHub API) ─────────────────────
  console.log('');
  console.log('  ' + bold('Fetching command file list...'));
  let commandFiles = [];
  try {
    const apiUrl = CV_GITHUB_API + '/' + REPO_CMDS_DIR;
    const body   = await fetchText(apiUrl, { headers: { 'User-Agent': 'codevision-cli', Accept: 'application/vnd.github.v3+json' } });
    const entries = JSON.parse(body);
    commandFiles  = entries.filter(e => e.type === 'file' && e.name.endsWith('.md'));
    console.log('  ' + dim('Found ' + commandFiles.length + ' command files'));
  } catch (err) {
    console.log(red('  Could not enumerate command files: ' + err.message));
    console.log(yellow('  Falling back to static list...'));
    // Fallback: hardcoded list of known v3 command files
    commandFiles = [
      '_STYLE', '_core',
      'cv.approve', 'cv.build', 'cv.chronicle', 'cv.clarify', 'cv.continue',
      'cv.debug', 'cv.define', 'cv.discover', 'cv.help', 'cv.init',
      'cv.persona', 'cv.reconcile', 'cv.roleplay', 'cv.spec', 'cv.status',
      'cv.tasks', 'cv.triage', 'cv.validate', 'cv.write',
    ].map(n => ({ name: n + '.md', download_url: `${CV_GITHUB_RAW}/${REPO_CMDS_DIR}/${n}.md` }));
  }

  console.log('');
  for (const f of commandFiles) {
    const dest = join(CV_COMMANDS, f.name);
    process.stdout.write('  commands/' + f.name.padEnd(34) + ' ');
    try {
      await downloadFile(f.download_url || (CV_GITHUB_RAW + '/' + REPO_CMDS_DIR + '/' + f.name), dest);
      console.log(green('✓'));
    } catch (err) { console.log(red('✗ ' + err.message)); errs++; }
  }

  if (errs > 0) {
    console.log('\n' + red(errs + ' file(s) failed.') + ' Run cv upgrade --force to retry.\n');
    process.exit(1);
  }

  // ── Reinstall into all known project AI tool folders ──────────────────────
  const allProjects = _listAllProjects();
  const projectsWithTools = allProjects.filter(p => p.config?.tools);
  if (projectsWithTools.length) {
    console.log('');
    console.log(bold('Updating AI tool command folders') + '\n');
    for (const { slug, config } of projectsWithTools) {
      const projectCwd = config.cwd || '';
      if (!projectCwd || !existsSync(projectCwd)) {
        info(slug + ': project cwd not found (' + (projectCwd || 'unset') + ') — skipping');
        continue;
      }
      console.log('  ' + bold(slug) + ' ' + dim(config.tools));
      reinstallCommandsForProject(config, projectCwd, { force: true });
    }
  }

  console.log('');
  await cmdMigrate(['--from', installedVersion, '--to', latestVersion]);
  setInstalledVersion(latestVersion);
  console.log('\n' + green('✓ Upgraded to v' + latestVersion));
  console.log('\n' + dim('Run: cd ~/.codevision/cli && npm link') + '\n');
}

// ─── cmd: migrate ─────────────────────────────────────────────────────────────

async function cmdMigrate(args) {
  const silent  = args.includes('--silent');
  const fromIdx = args.indexOf('--from');
  const toIdx   = args.indexOf('--to');
  const fromVer = fromIdx >= 0 ? args[fromIdx + 1] : getInstalledVersion();
  const toVer   = toIdx   >= 0 ? args[toIdx + 1]   : CV_VERSION;
  const log     = silent ? () => {} : m => console.log(m);
  const warnLog = m => console.log(yellow(m));

  const allProjects = _listAllProjects();
  if (!allProjects.length) { log('No projects found.'); return; }
  if (!silent) console.log(bold('Running migrations') + ' (v' + fromVer + ' → v' + toVer + ')\n');

  let any = false;
  for (const { slug, root } of allProjects) {
    const pvp = join(root, '.cv-version');
    const pv  = existsSync(pvp) ? readFileSync(pvp, 'utf8').trim() : fromVer;
    const pending = MIGRATIONS.filter(m => semverLt(pv, m.version) && !semverLt(toVer, m.version));
    if (!pending.length) { log('  ' + bold(slug) + ' — up to date'); continue; }
    any = true;
    log('  ' + bold(slug) + ' — applying ' + pending.length + ' migration(s)');
    const success = migrateProject(root, pv, toVer, { log, warn: warnLog });
    if (success) { writeFileSync(pvp, toVer); log('  ' + green('✓') + ' ' + slug + ' → v' + toVer); }
    else warnLog('  ' + red('✗') + ' ' + slug + ' — migration errors, see above');
    log('');
  }
  if (!any && !silent) console.log(green('All projects up to date.') + '\n');
}

// ─── Network helpers ──────────────────────────────────────────────────────────

function fetchText(url, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'codevision-cli', ...options.headers } };
    https.get(url, opts, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchText(res.headers.location, options).then(resolve, reject);
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode + ' — ' + url)); return; }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'codevision-cli' } };
    https.get(url, opts, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      const out = createWriteStream(dest);
      res.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

const [, , command, ...rest] = process.argv;

const COMMANDS = {
  init:    args => cmdInit(args).catch(e => { console.error(red('\n' + e.message)); process.exit(1); }),
  fetch:   cmdFetch,
  status:  cmdStatus,
  lint:    cmdLint,
  stories: cmdStories,
  ask:     args => cmdAsk(args).catch(e => { console.error(red('\n' + e.message)); process.exit(1); }),
  upgrade: args => cmdUpgrade(args).catch(e => { console.error(red('\n' + e.message)); process.exit(1); }),
  migrate: args => cmdMigrate(args).catch(e => { console.error(red('\n' + e.message)); process.exit(1); }),
};

if (!command || command === '--help' || command === '-h') {
  console.log(`
${bold('cv')} — CodeVision CLI v${CV_VERSION}

${bold('Usage:')}
  cv init [name]              Interactive setup wizard (creates folder structure)
  cv fetch [slug] [--full]    Show artifacts to load into AI context
  cv status [slug]            Print project state (phase, active feature, validation block)
  cv lint [slug]              Validate structure and check for validation blocks
  cv stories <slug> <source>  Parse a story document into CHR files
  cv ask [--multi] <q> <opts> Present a multiple-choice question in the terminal
  cv upgrade                  Upgrade CLI and commands from GitHub
  cv upgrade --check          Check if an update is available
  cv upgrade --migrate        Run migrations only (no file downloads)
  cv migrate                  Run pending migrations on all projects

${bold('Flags:')}
  --force   Overwrite existing command files during init

${bold('Artifact storage:')}
  Project mode  .cv/ inside your project directory (committed to git)
  System mode   ~/.codevision/projects/<slug>/

${bold('Phase lifecycle:')}
  explore → define → specify → task → build → triage → prove

${bold('Supported AI tools:')}
${WIZARD_TARGETS.map(t => '  ' + t.name.padEnd(20) + dim(t.destDir || t.destFile || '')).join('\n')}

${bold('Examples:')}
  cv init
  cv init "Aiko Health"
  cv fetch aiko-health
  cv lint aiko-health
  cv status
`);
  process.exit(0);
}

const handler = COMMANDS[command];
if (!handler) die('Unknown command: "' + command + '"\nRun cv --help for usage.');
handler(rest);