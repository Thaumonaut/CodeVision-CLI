/**
 * cv-migrate.js — CodeVision project migration system
 *
 * Each migration is an object with:
 *   version     — semver string this migration brings a project TO
 *   description — human-readable summary of what changed
 *   migrate(projectDir, { existsSync, mkdirSync, writeFileSync, readFileSync, join })
 *               — function that transforms the project folder. Must be idempotent.
 *               — returns { added: [], skipped: [], warnings: [] }
 *
 * Rules:
 *   - Never delete user files
 *   - Never overwrite files that already have content (unless explicitly versioned)
 *   - Adding missing folders and seed files is always safe
 *   - Log every action — the user should know exactly what changed
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// ─── Migration registry ───────────────────────────────────────────────────────
// Migrations run in order. Each one is applied only if the project's recorded
// version is below the migration's target version.

export const MIGRATIONS = [

  // ── v2.2.0 ──────────────────────────────────────────────────────────────────
  // Added: stakeholders/ folder, product.md placeholder, updated seed files
  {
    version: '2.2.0',
    description: 'Add stakeholders/ folder and product.md placeholder',
    migrate(projectDir) {
      const added = [], skipped = [], warnings = [];

      // New folder: stakeholders/
      const stakeholdersDir = join(projectDir, 'stakeholders');
      if (!existsSync(stakeholdersDir)) {
        mkdirSync(stakeholdersDir, { recursive: true });
        added.push('stakeholders/');
      } else {
        skipped.push('stakeholders/ (already exists)');
      }

      // New seed file: product.md (placeholder only — do not overwrite if exists)
      const productPath = join(projectDir, 'product.md');
      if (!existsSync(productPath)) {
        writeFileSync(productPath, [
          '# Product — [Product Name]',
          '<!-- product.md | Run /cv.product to define this. -->',
          '<!-- Loaded by /cv.chronicle, /cv.persona, /cv.prd, and any command that produces user-facing content. -->',
          '',
          '## Elevator Pitch',
          '',
          '[TBD — run /cv.product to define]',
          '',
          '---',
          '',
          '_Created by cv upgrade v2.2.0 migration — replace with /cv.product_',
        ].join('\n'));
        added.push('product.md (placeholder)');
      } else {
        skipped.push('product.md (already exists — not overwritten)');
      }

      // Ensure components/registry.md exists (was added in earlier version,
      // may be missing from very early project inits)
      const registryPath = join(projectDir, 'components', 'registry.md');
      if (!existsSync(join(projectDir, 'components'))) {
        mkdirSync(join(projectDir, 'components'), { recursive: true });
        added.push('components/');
      }
      if (!existsSync(registryPath)) {
        writeFileSync(registryPath, '# Component Registry\n\n<!-- Entries written by /cv.component -->\n');
        added.push('components/registry.md');
      }

      return { added, skipped, warnings };
    },
  },

  // ── v2.3.0 ──────────────────────────────────────────────────────────────────
  // Placeholder for next version — add real migration content when spec changes
  // {
  //   version: '2.3.0',
  //   description: '...',
  //   migrate(projectDir) { ... }
  // },

];

// ─── Version comparison ───────────────────────────────────────────────────────

export function semverLt(a, b) {
  // Returns true if a < b
  const parse = v => v.split('.').map(Number);
  const [aMaj, aMin, aPatch] = parse(a);
  const [bMaj, bMin, bPatch] = parse(b);
  if (aMaj !== bMaj) return aMaj < bMaj;
  if (aMin !== bMin) return aMin < bMin;
  return aPatch < bPatch;
}

// ─── Run migrations for a single project ─────────────────────────────────────

export function migrateProject(projectDir, currentVersion, targetVersion, { log, warn }) {
  const pending = MIGRATIONS.filter(m =>
    semverLt(currentVersion, m.version) &&
    !semverLt(targetVersion, m.version)
  );

  if (pending.length === 0) {
    log(`  No migrations needed (already at v${currentVersion})`);
    return true;
  }

  let allOk = true;

  for (const migration of pending) {
    log(`  Running migration → v${migration.version}: ${migration.description}`);
    try {
      const { added, skipped, warnings } = migration.migrate(projectDir);
      for (const f of added)    log(`    + ${f}`);
      for (const f of skipped)  log(`    ~ ${f}`);
      for (const w of warnings) warn(`    ⚠ ${w}`);
    } catch (err) {
      warn(`    ✗ Migration v${migration.version} failed: ${err.message}`);
      allOk = false;
    }
  }

  return allOk;
}
