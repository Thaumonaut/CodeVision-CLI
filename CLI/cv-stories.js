/**
 * cv-stories.js
 *
 * Parses a document containing multiple user stories and converts each
 * one into a Chronicle (CHR-###.md) following the CodeVision schema.
 *
 * Usage:
 *   cv stories <slug> <file-or-url>              Batch mode (writes [OPEN] placeholders)
 *   cv stories <slug> <file-or-url> --interactive Full Q&A per story before writing
 *
 * Supported inputs:
 *   - .md / .txt files
 *   - .docx files (via mammoth)
 *   - Google Docs public URLs (exported as plain text)
 *
 * Requires:
 *   ANTHROPIC_API_KEY env var
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { homedir } from 'os';
import * as readline from 'readline';

// ─── Constants ────────────────────────────────────────────────────────────────

const CV_ROOT    = join(homedir(), '.codevision');
const PROJECTS   = join(CV_ROOT, 'projects');
const API_URL    = 'https://api.anthropic.com/v1/messages';
const MODEL      = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

// ─── Colour helpers ───────────────────────────────────────────────────────────

const bold   = s => `\x1b[1m${s}\x1b[0m`;
const green  = s => `\x1b[32m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const dim    = s => `\x1b[2m${s}\x1b[0m`;
const cyan   = s => `\x1b[36m${s}\x1b[0m`;

const ok   = msg => console.log(`  ${green('✓')} ${msg}`);
const warn = msg => console.log(`  ${yellow('!')} ${msg}`);
const info = msg => console.log(`  ${dim('·')} ${msg}`);
const die  = msg => { console.error(`\n${red('Error:')} ${msg}\n`); process.exit(1); };

// ─── Readline helper ──────────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function askChoice(rl, prompt, options) {
  console.log(`\n${prompt}\n`);
  options.forEach((opt, i) => console.log(`  ${cyan(String(i + 1))}  ${opt}`));
  console.log(`  ${cyan(String(options.length + 1))}  → Custom — I'll define it`);
  console.log('');

  while (true) {
    const raw = await ask(rl, `  Choice (1–${options.length + 1}): `);
    const n = parseInt(raw.trim(), 10);
    if (n === options.length + 1) {
      const custom = await ask(rl, '  Your answer: ');
      return custom.trim();
    }
    if (n >= 1 && n <= options.length) {
      // Return just the label part before the em-dash if present
      return options[n - 1].split(' — ')[0].trim();
    }
    console.log(`  ${red('Please enter a number between 1 and')} ${options.length + 1}`);
  }
}

// ─── Document reading ─────────────────────────────────────────────────────────

async function readDocument(source) {
  // Google Docs URL
  if (source.startsWith('https://docs.google.com/document/d/')) {
    return await readGoogleDoc(source);
  }

  if (!existsSync(source)) die(`File not found: ${source}`);
  const ext = extname(source).toLowerCase();

  if (ext === '.docx') {
    return await readDocx(source);
  }

  if (ext === '.md' || ext === '.txt' || ext === '') {
    return readFileSync(source, 'utf8');
  }

  die(`Unsupported file type: ${ext}\nSupported: .md .txt .docx, or a Google Docs URL`);
}

async function readGoogleDoc(url) {
  // Extract doc ID from various Google Docs URL formats
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) die(`Could not extract document ID from URL:\n  ${url}`);

  const docId   = match[1];
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  info(`Fetching Google Doc ${dim(docId)} ...`);
  const res = await fetch(exportUrl);

  if (res.status === 404) {
    die('Google Doc not found. Make sure the document exists.');
  }
  if (res.status === 403 || res.status === 401) {
    die(
      'Cannot access this Google Doc.\n' +
      '  For private documents, share the doc publicly (view only)\n' +
      '  or use cv import to set up authenticated access.'
    );
  }
  if (!res.ok) {
    die(`Google Docs export failed (HTTP ${res.status}). Check the URL and try again.`);
  }

  return await res.text();
}

async function readDocx(filePath) {
  let mammoth;
  try {
    mammoth = (await import('mammoth')).default;
  } catch {
    die(
      'mammoth is required for .docx support.\n' +
      '  Run: npm install mammoth\n' +
      '  Then try again.'
    );
  }

  const result = await mammoth.extractRawText({ path: filePath });
  if (result.messages.length) {
    result.messages.forEach(m => warn(`docx: ${m.message}`));
  }
  return result.value;
}

// ─── Anthropic API call ───────────────────────────────────────────────────────

async function callAPI(messages, systemPrompt, maxTokens = MAX_TOKENS) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    die(
      'ANTHROPIC_API_KEY environment variable is not set.\n' +
      '  Export it before running: export ANTHROPIC_API_KEY=sk-ant-...'
    );
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':          apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    die(`Anthropic API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ─── Story extraction ─────────────────────────────────────────────────────────

async function extractStories(docText) {
  const systemPrompt = `You are a product analyst helping to parse a document containing one or more user stories or user journeys.

Your job is to identify the distinct stories in the document and extract the key information from each one.

Return ONLY valid JSON — no preamble, no markdown fences, no explanation.

Return this exact structure:
{
  "stories": [
    {
      "title": "Short descriptive title for this story",
      "raw_text": "The relevant portion of the document for this story",
      "persona_hint": "Any mentioned user name, role, or archetype",
      "trigger_hint": "What causes the user to act or open the product",
      "outcome_hint": "What success looks like for the user",
      "ambiguous": false,
      "ambiguity_note": ""
    }
  ],
  "ambiguous_boundaries": [
    {
      "description": "Description of the ambiguity",
      "option_a": "If treated as separate stories: ...",
      "option_b": "If merged into one story: ..."
    }
  ]
}

Rules:
- A "story" is a distinct user journey with its own persona, trigger, and outcome
- If a section could be one story or two, set ambiguous: true on the affected stories and describe the ambiguity in ambiguous_boundaries
- Preserve the raw_text faithfully — do not paraphrase or summarize it
- ambiguity_note on each story should briefly explain the ambiguity if ambiguous: true`;

  const text = await callAPI(
    [{ role: 'user', content: `Parse the following document into user stories:\n\n${docText}` }],
    systemPrompt,
    2048
  );

  try {
    const clean = text.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
    return JSON.parse(clean);
  } catch {
    die(`Could not parse story extraction response. Raw response:\n\n${text}`);
  }
}

// ─── Interactive ambiguity resolution ────────────────────────────────────────

async function resolveAmbiguities(extracted, rl) {
  if (!extracted.ambiguous_boundaries?.length) return extracted.stories;

  console.log(`\n${bold('Ambiguous story boundaries found')} — let's resolve them before writing.\n`);

  const finalStories = [...extracted.stories];

  for (const amb of extracted.ambiguous_boundaries) {
    console.log(`  ${yellow('?')} ${amb.description}\n`);
    const choice = await askChoice(rl, 'How should this be treated?', [
      `Split into separate stories — ${amb.option_a}`,
      `Merge into one story — ${amb.option_b}`,
    ]);

    // Mark ambiguous stories as resolved based on choice
    for (const story of finalStories) {
      if (story.ambiguous) {
        story.resolved_as = choice.startsWith('Split') ? 'split' : 'merge';
        story.ambiguous = false;
      }
    }
  }

  // If any were marked merge, collapse adjacent ones
  const merged = [];
  let i = 0;
  while (i < finalStories.length) {
    const s = finalStories[i];
    if (s.resolved_as === 'merge' && merged.length > 0) {
      const prev = merged[merged.length - 1];
      prev.title       = `${prev.title} + ${s.title}`;
      prev.raw_text    += '\n\n' + s.raw_text;
      prev.outcome_hint = s.outcome_hint || prev.outcome_hint;
    } else {
      merged.push({ ...s });
    }
    i++;
  }

  return merged;
}

// ─── CHR ID assignment ────────────────────────────────────────────────────────

function nextChrId(chroniclesDir) {
  if (!existsSync(chroniclesDir)) return 1;
  const existing = readdirSync(chroniclesDir)
    .filter(f => /^CHR-\d+\.md$/.test(f))
    .map(f => parseInt(f.replace('CHR-', '').replace('.md', ''), 10));
  return existing.length ? Math.max(...existing) + 1 : 1;
}

function formatChrId(n) {
  return `CHR-${String(n).padStart(3, '0')}`;
}

// ─── Chronicle generation — batch mode ───────────────────────────────────────

async function generateChronicleBatch(story, chrId) {
  const systemPrompt = `You are a product analyst writing a CodeVision Chronicle document from a user story.

A Chronicle captures a user journey in structured form. Fill in as much as you can from the story text.
For fields you cannot determine from the text, use the placeholder: [OPEN: brief description of what's needed]

Return ONLY the raw markdown content — no preamble, no explanation.

Use exactly this structure:

# Chronicle ${chrId} — TITLE

## Persona
**Name / Archetype:** VALUE
**Relationship to product:** new user / returning user / power user
**Context:** VALUE
**Tech comfort:** low / medium / high

## Trigger
VALUE

## Journey

### 1. PHASE NAME
VALUE

### 2. PHASE NAME
VALUE

## Key Emotional Moment
VALUE

## Success Signal
VALUE

## Failure Path
VALUE

## Features Implicated
| ID | Title | Role |
|---|---|---|
| TBD | FEATURE NAME | Primary |

## Open Questions
- [ ] [OPEN] QUESTION

---
_Status: needs-review | Created: DATE_`;

  const content = await callAPI(
    [{
      role: 'user',
      content: `Story title: ${story.title}\n\nStory text:\n${story.raw_text}\n\n` +
               `Persona hint: ${story.persona_hint || 'not mentioned'}\n` +
               `Trigger hint: ${story.trigger_hint || 'not mentioned'}\n` +
               `Outcome hint: ${story.outcome_hint || 'not mentioned'}\n\n` +
               `Today's date: ${new Date().toISOString().slice(0, 10)}\n` +
               `Chronicle ID: ${chrId}`
    }],
    systemPrompt,
    MAX_TOKENS
  );

  return content.trim();
}

// ─── Chronicle generation — interactive mode ──────────────────────────────────

async function generateChronicleInteractive(story, chrId, rl) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${bold(`Chronicle ${chrId}`)} — ${cyan(story.title)}`);
  console.log(`${'─'.repeat(60)}\n`);
  console.log(dim('Story excerpt:'));
  console.log(dim(story.raw_text.slice(0, 300) + (story.raw_text.length > 300 ? '...' : '')));
  console.log('');

  const TOTAL = 7;
  const answers = {};

  // Q1 — Persona
  console.log(`\n${bold(`Question 1 of ${TOTAL}`)} ${dim('(blocking)')}`);
  answers.persona = await askChoice(rl,
    story.persona_hint
      ? `The story mentions "${story.persona_hint}". How would you describe this user?`
      : 'Who is the primary user in this journey?',
    [
      'First-time user — unfamiliar with the product, needs guidance',
      'Returning user — knows the basics, building on prior experience',
      'Power user — confident, looking for efficiency and depth',
      'External user — sent here by a doctor, employer, or referral',
    ]
  );

  // Q2 — Trigger
  console.log(`\n${bold(`Question 2 of ${TOTAL}`)} ${dim('(blocking)')}`);
  answers.trigger = await askChoice(rl,
    story.trigger_hint
      ? `The trigger seems to be: "${story.trigger_hint}". Is this accurate, or something else?`
      : 'What causes this user to open the product at this specific moment?',
    [
      'A specific event just happened — health scare, test result, recommendation',
      'Ongoing frustration — they\'ve been managing this problem manually for a while',
      'Curiosity — they heard about it and want to explore',
      'Obligation — someone else asked them to use it',
    ]
  );

  // Q3 — Emotional arc
  console.log(`\n${bold(`Question 3 of ${TOTAL}`)} ${dim('(advisory)')}`);
  answers.emotion = await askChoice(rl,
    'What best describes how this user feels at the start of the journey?',
    [
      'Anxious — worried about what they\'ll find or what it means',
      'Confused — overwhelmed by information they don\'t understand',
      'Motivated — ready to take action, just need the right tool',
      'Skeptical — not sure this will actually help them',
    ]
  );

  // Q4 — Key moment
  console.log(`\n${bold(`Question 4 of ${TOTAL}`)} ${dim('(advisory)')}`);
  answers.keyMoment = await ask(rl, `  What's the most important moment in this journey — the one where the product either earns trust or loses it?\n  Your answer: `);

  // Q5 — Success signal
  console.log(`\n${bold(`Question 5 of ${TOTAL}`)} ${dim('(blocking)')}`);
  answers.success = await askChoice(rl,
    story.outcome_hint
      ? `The story suggests success looks like: "${story.outcome_hint}". Does this match?`
      : 'How does the user know the journey succeeded?',
    [
      'They leave with a clear action plan they\'re confident in',
      'They understand something they were confused about before',
      'They complete a task they couldn\'t do without the product',
      'They feel reassured — the worry that brought them here is resolved',
    ]
  );

  // Q6 — Failure path
  console.log(`\n${bold(`Question 6 of ${TOTAL}`)} ${dim('(advisory)')}`);
  answers.failure = await askChoice(rl,
    'What happens if the product fails at the key moment?',
    [
      'User leaves frustrated and doesn\'t come back',
      'User contacts support or looks for help elsewhere',
      'User gets a harmful outcome — wrong info, missed escalation',
      'User just ignores it — low stakes, low urgency',
    ]
  );

  // Q7 — Features
  console.log(`\n${bold(`Question 7 of ${TOTAL}`)} ${dim('(blocking)')}`);
  const featInput = await ask(rl, `  What product features does this journey depend on? (comma-separated names, or leave blank)\n  Your answer: `);
  answers.features = featInput.split(',').map(f => f.trim()).filter(Boolean);

  // Recap
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${bold('Pre-draft recap')}\n`);
  console.log(
    `This journey follows a ${answers.persona.toLowerCase()} who opens the product because ${answers.trigger.toLowerCase()}. ` +
    `They arrive feeling ${answers.emotion.toLowerCase()}, and the critical moment is: ${answers.keyMoment.trim()}. ` +
    `The journey succeeds when ${answers.success.toLowerCase()}. ` +
    `If it fails, ${answers.failure.toLowerCase()}. ` +
    (answers.features.length ? `Key features implicated: ${answers.features.join(', ')}.` : 'No specific features identified yet.')
  );
  console.log('');

  const confirm = await ask(rl, '  Anything to correct before I write the chronicle? (press Enter to continue, or type a correction): ');

  // Build the chronicle using the API with the collected answers as context
  const systemPrompt = `You are writing a CodeVision Chronicle document. 
You have collected answers from the PM through an interactive Q&A session.
Use ALL of the provided answers to write a complete, high-quality chronicle.
Do not use any [OPEN] placeholders — all fields should be filled from the Q&A answers.
Return ONLY the raw markdown — no preamble.

Use exactly this structure:

# Chronicle CHRID — TITLE

## Persona
**Name / Archetype:** VALUE
**Relationship to product:** VALUE
**Context:** VALUE
**Tech comfort:** VALUE

## Trigger
VALUE

## Journey

### 1. PHASE NAME
VALUE

### 2. PHASE NAME
VALUE

### 3. PHASE NAME  
VALUE

## Key Emotional Moment
VALUE

## Success Signal
VALUE

## Failure Path
VALUE

## Features Implicated
| ID | Title | Role |
|---|---|---|
| TBD | FEATURE NAME | Primary |

## Open Questions
<!-- None — resolved during interactive session -->

---
_Status: draft | Created: DATE_`;

  const content = await callAPI([{
    role: 'user',
    content:
      `Chronicle ID: ${chrId}\n` +
      `Story title: ${story.title}\n` +
      `Original story text: ${story.raw_text}\n\n` +
      `Q&A Answers:\n` +
      `- Persona type: ${answers.persona}\n` +
      `- Trigger: ${answers.trigger}\n` +
      `- Emotional state at start: ${answers.emotion}\n` +
      `- Key moment: ${answers.keyMoment}\n` +
      `- Success signal: ${answers.success}\n` +
      `- Failure path: ${answers.failure}\n` +
      `- Features: ${answers.features.join(', ') || 'TBD'}\n` +
      (confirm.trim() ? `- PM correction: ${confirm}\n` : '') +
      `\nToday's date: ${new Date().toISOString().slice(0, 10)}`
  }], systemPrompt, MAX_TOKENS);

  return content.trim();
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function cmdStories(args) {
  const interactive = args.includes('--interactive');
  const positional  = args.filter(a => !a.startsWith('--'));
  const [slug, source] = positional;

  if (!slug || !source) {
    die(
      'Usage: cv stories <slug> <file-or-url> [--interactive]\n\n' +
      'Examples:\n' +
      '  cv stories aiko-health stories.md\n' +
      '  cv stories aiko-health stories.docx\n' +
      '  cv stories aiko-health "https://docs.google.com/document/d/..." --interactive'
    );
  }

  const projectDir = join(PROJECTS, slug);
  if (!existsSync(projectDir)) {
    die(`Project "${slug}" not found.\n  Run: cv init ${slug}`);
  }

  const chroniclesDir = join(projectDir, 'chronicles');

  // ── Step 1: Read document
  console.log(`\n${bold('CodeVision')} — ${cyan('cv stories')}\n`);
  info(`Reading ${dim(source)} ...`);
  const docText = await readDocument(source);
  ok(`Document read (${docText.length.toLocaleString()} chars)`);

  // ── Step 2: Extract stories
  info('Identifying stories via AI ...');
  const extracted = await extractStories(docText);
  const storyCount = extracted.stories.length;
  const ambigCount = extracted.ambiguous_boundaries?.length ?? 0;

  ok(`Found ${bold(storyCount)} story${storyCount !== 1 ? 'ies' : ''}`);
  if (ambigCount) warn(`${ambigCount} ambiguous boundary${ambigCount !== 1 ? 'ies' : ''} detected`);

  // ── Step 3: Resolve ambiguities (always interactive if any found)
  let stories = extracted.stories;
  if (ambigCount > 0) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    stories = await resolveAmbiguities(extracted, rl);
    rl.close();
    ok(`Boundaries resolved → ${bold(stories.length)} final story${stories.length !== 1 ? 'ies' : ''}`);
  }

  // ── Step 4: Generate chronicles
  console.log(`\n${bold(interactive ? 'Interactive mode' : 'Batch mode')} — writing ${stories.length} chronicle${stories.length !== 1 ? 's' : ''}\n`);

  let rl;
  if (interactive) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }

  const written = [];

  for (let i = 0; i < stories.length; i++) {
    const story   = stories[i];
    const chrNum  = nextChrId(chroniclesDir) + i; // account for ones written this run
    const chrId   = formatChrId(chrNum);
    const outPath = join(chroniclesDir, `${chrId}.md`);

    if (!interactive) {
      process.stdout.write(`  ${dim('·')} Generating ${bold(chrId)} — ${story.title} ...`);
    }

    const content = interactive
      ? await generateChronicleInteractive(story, chrId, rl)
      : await generateChronicleBatch(story, chrId);

    writeFileSync(outPath, content, 'utf8');

    if (!interactive) {
      process.stdout.write(`\r  ${green('✓')} ${bold(chrId)} — ${story.title}\n`);
    } else {
      console.log(`\n  ${green('✓')} ${bold(chrId)} written`);
    }

    written.push({ chrId, title: story.title, path: outPath, interactive });
  }

  if (rl) rl.close();

  // ── Step 5: Log to decisions.md
  const decisionsPath = join(projectDir, 'ledger', 'decisions.md');
  if (existsSync(decisionsPath)) {
    const entry =
      `\n[${new Date().toISOString().slice(0,10)}] [cv stories] [${slug}] ` +
      `DECISION: Imported ${written.length} chronicle(s) from ${source} | ` +
      `MODE: ${interactive ? 'interactive' : 'batch'} | ` +
      `IDS: ${written.map(w => w.chrId).join(', ')}\n`;
    const existing = readFileSync(decisionsPath, 'utf8');
    writeFileSync(decisionsPath, existing + entry, 'utf8');
  }

  // ── Summary
  console.log(`\n${bold('Done.')}\n`);
  for (const { chrId, title, interactive: wasInteractive } of written) {
    const tag = wasInteractive ? green('draft') : yellow('needs-review');
    console.log(`  ${bold(chrId)}  [${tag}]  ${title}`);
  }

  if (!interactive) {
    console.log(`\n${dim('Fields marked [OPEN] need clarification. Run:')}`);
    console.log(`  ${green('/cv.clarify')} ${dim('in your AI assistant to resolve them one by one.')}`);
  }

  console.log(`\n${dim('Chronicles saved to:')} ${chroniclesDir}\n`);
}
