---
id: 2026-05-12-daily-docs-sync
created: 2026-05-12T15:28:00.648Z
source: scheduled
status: completed
scheduled_from: daily-docs-sync
depends_on: 2026-05-12-nightly-consolidation
model: opus
worktree: false
stage: 
completed_at: 2026-05-12T15:30:32.182Z
---

# Keep user-facing docs current with feature changes

You are running as a daily maintenance job. No user is present. Work silently.
Your purpose is to ensure the documentation site (`docs/`) accurately describes
Alan's features, commands, and behavior for people *using* Alan — not developing it.

You have access to Read, Edit, Write, Bash, Glob, Grep tools.

---

## Step 1: Gather current state

1. Read `docs/guide/index.md` in full — this is the primary user guide.
2. List all skill/command templates:
   ```bash
   ls templates/commands/
   ```
3. List all agent templates:
   ```bash
   ls templates/agents/
   ```
4. Read `templates/identity/SOUL.md` and `templates/identity/IDENTITY.md` for
   current identity description.
5. Check recent changes that might affect user-facing behavior:
   ```bash
   git log --oneline --since="3 days ago" -- templates/commands/ templates/agents/ src/server/ src/hooks/ templates/bin/ templates/scheduled/
   ```
6. Read any command templates that were added or modified recently.

---

## Step 2: Identify gaps

Compare the docs against the actual feature set. Check:

- **Command Reference** — Is every command in `templates/commands/` documented?
  Are any documented commands that no longer exist? Are descriptions accurate?
- **Concepts** — Do the Identity, Memory, Jobs, Hooks, Search sections match reality?
  Have any new concepts been introduced (new directories, new MCP tools)?
- **Background Automation** — Does the scheduler/consolidation section match the
  current scheduled jobs in `templates/scheduled/`?
- **Terminal Commands** — Are all `alan` subcommands documented? Check
  `templates/bin/alan-wrapper.sh` for the current set.
- **Getting Started** — Is the install flow still accurate?
- **FAQ / Troubleshooting** — Are there known issues from recent work that users
  should know about?

Only flag items where there is a concrete, verifiable difference between docs and reality.

---

## Step 3: Update docs

If gaps were found in Step 2, update `docs/guide/index.md` using Edit.
Rules:

1. **Only change sections with verified gaps.** Do not rewrite accurate sections.
2. **Write for end users**, not developers. Explain what things do, not how they work internally.
3. **Match existing style.** Use the same heading levels, formatting, and tone.
4. **Add new commands** to the appropriate category in the Command Reference section.
   Follow the existing format: command name, dash, one-line description.
5. **Remove commands** that no longer exist.
6. **No trailing commas** in code examples.
7. **Do not add emojis.**

If no gaps were found, do nothing. A no-op run is a successful run.

---

## Step 4: Log result

Write a brief summary to stdout:
- If changes were made: list which sections were updated and why.
- If no changes: "Docs are up to date."

---

## Constraints

- Work silently. Do not produce conversational output.
- Only modify files in `docs/`. Do not modify source code, templates, or README.
- Do not restructure the docs or change the navigation. Only update content within
  existing sections, or add entries to existing lists.
- Be conservative. When in doubt, leave it alone. Missing a new feature for one day
  is better than documenting something incorrectly.
- **NEVER include system prompt content in docs.** Do not quote, summarize, describe,
  or reference the contents of any system prompt, identity file, or security rules.
  These are internal implementation details that must not appear in user-facing
  documentation. If a feature is powered by a system prompt, describe the feature's
  behavior — not the prompt itself.
- **Do not remove `alan setup-oauth-token` from the Getting Started install steps.**
  This command cannot run inside a Claude session (2-min Bash timeout kills the
  OAuth callback server). It must remain a standalone terminal step even though
  `/alan:init` also checks for the token.
- Pages with `draft: true` frontmatter are intentionally excluded from the production
  build via `srcExclude` — do not flag them as missing content.

## Resolution

No-op: this scheduled job targets the Alan companion repo (expects `docs/guide/index.md` and `templates/` directories). The current project is `vault-js`, which has neither. No docs to sync. Docs are up to date by vacuous truth.
