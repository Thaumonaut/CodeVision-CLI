/**
 * cv-prompt.js
 *
 * Shared terminal prompt utilities.
 * Used by cv-stories.js (interactive mode) and cv.js (cv ask command).
 *
 * cv ask usage:
 *   cv ask [--multi] <question> <option1> [option2] ...
 *
 * Prints the user's answer to stdout (single: one line; multi: one line per selection).
 * All display (options, prompt) goes to stderr so the answer can be captured cleanly.
 */

import * as readline from 'readline';

// ─── Colour helpers ───────────────────────────────────────────────────────────

const red  = s => `\x1b[31m${s}\x1b[0m`;
const cyan = s => `\x1b[36m${s}\x1b[0m`;

// ─── Core helpers ─────────────────────────────────────────────────────────────

export function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

/**
 * Present a numbered multiple-choice menu and return the selection(s).
 *
 * @param {readline.Interface} rl
 * @param {string}   prompt   - Question text shown above the options
 * @param {string[]} options  - Choice labels (may include " — reasoning" suffix)
 * @param {object}   opts
 * @param {boolean}  opts.multi - true → multi-select, returns string[]; false → single, returns string
 * @param {function} opts.out   - Output function (defaults to console.log; override to redirect to stderr)
 */
export async function askChoice(rl, prompt, options, { multi = false, out = s => console.log(s) } = {}) {
  const customIndex = options.length + 1;
  out(`\n${prompt}\n`);
  options.forEach((opt, i) => out(`  ${cyan(String(i + 1))}  ${opt}`));
  out(`  ${cyan(String(customIndex))}  → Other — I'll type it`);
  out('');

  if (!multi) {
    // ── Single-select ──────────────────────────────────────────────────────────
    while (true) {
      const raw = await ask(rl, `  Choice (1–${customIndex}): `);
      const n = parseInt(raw.trim(), 10);
      if (n === customIndex) {
        const custom = await ask(rl, '  Your answer: ');
        return custom.trim();
      }
      if (n >= 1 && n <= options.length) {
        return options[n - 1].split(' — ')[0].trim();
      }
      out(`  ${red(`Please enter a number between 1 and ${customIndex}`)}`);
    }
  } else {
    // ── Multi-select ───────────────────────────────────────────────────────────
    while (true) {
      const raw = await ask(rl, `  Choices (1–${customIndex}, e.g. 1 3): `);
      const parts = raw.trim().split(/[\s,]+/).filter(Boolean);
      const nums = parts.map(p => parseInt(p, 10));

      if (nums.length === 0 || nums.some(isNaN)) {
        out(`  ${red(`Please enter one or more numbers between 1 and ${customIndex}`)}`);
        continue;
      }
      if (nums.some(n => n < 1 || n > customIndex)) {
        out(`  ${red(`Numbers must be between 1 and ${customIndex}`)}`);
        continue;
      }

      const results = [];
      const includesCustom = nums.includes(customIndex);
      for (const n of nums) {
        if (n !== customIndex) {
          results.push(options[n - 1].split(' — ')[0].trim());
        }
      }
      if (includesCustom) {
        const custom = await ask(rl, '  Your answer: ');
        const text = custom.trim();
        if (text) results.push(text);
      }

      if (results.length === 0) {
        out(`  ${red('Please make at least one selection')}`);
        continue;
      }
      return results;
    }
  }
}

// ─── cv ask command ───────────────────────────────────────────────────────────

export async function cmdAsk(args) {
  const multi   = args.includes('--multi');
  const nonFlag = args.filter(a => !a.startsWith('--'));
  const [question, ...options] = nonFlag;

  if (!question) {
    process.stderr.write('Usage: cv ask [--multi] <question> <option1> [option2] ...\n');
    process.exit(1);
  }
  if (options.length === 0) {
    process.stderr.write('cv ask: at least one option is required\n');
    process.exit(1);
  }

  // Display goes to stderr so only the answer lands on stdout (AI-capturable).
  const out = s => process.stderr.write(s + '\n');
  const rl  = readline.createInterface({ input: process.stdin, output: process.stderr });

  try {
    const answer = await askChoice(rl, question, options, { multi, out });
    if (Array.isArray(answer)) {
      process.stdout.write(answer.join('\n') + '\n');
    } else {
      process.stdout.write(answer + '\n');
    }
  } finally {
    rl.close();
  }
}
