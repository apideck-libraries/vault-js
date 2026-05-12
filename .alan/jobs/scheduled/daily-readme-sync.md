---
id: daily-readme-sync
schedule: 0 6 * * *
source: system
paused: false
chain_group: nightly-pipeline
chain_after: nightly-consolidation
model: opus
completion_mode: merge
worktree: false
scope: alan-only
last_run: 2026-05-12T04:00:00.000Z
---

# Keep README.md accurate for developers

You are running as a daily maintenance job. No user is present. Work silently.
Your purpose is to ensure README.md reflects the current state of the codebase
for people developing Alan — architecture, build/test commands, technical notes,
and development workflow.

You have access to Read, Edit, Write, Bash, Glob, Grep tools.

---

## Step 1: Gather current state

1. Read `README.md` in full.
2. Read `package.json` to check scripts, dependencies, and engine requirements.
3. Run `ls src/` and `ls templates/` to see the current directory structure.
4. Read `CLAUDE.md` for any technical notes that should be reflected.
5. Scan for recent meaningful changes:
   ```bash
   git log --oneline --since="3 days ago" -- src/ templates/ bin/ package.json
   ```
6. Check for new top-level directories or significant structural changes:
   ```bash
   ls -d */
   ```

---

## Step 2: Identify drift

Compare the README against reality. Check each section:

- **Prerequisites** — Do Node.js version, package manager, and any native deps still match?
- **Setup / Build / Test / Lint commands** — Do the `yarn` commands in README match `package.json` scripts?
- **Developer Workflow** — Is the `ALAN_HOME_REPO` / `--dev` workflow still accurate?
- **Evals** — Do eval commands and descriptions match what exists in `src/eval/`?
- **Architecture tree** — Does the directory tree match the actual `src/` and `templates/` layout?
  Compare each line of the ASCII tree against reality. Add new directories, remove deleted ones.
- **How It Works** — Is the installer flow description still accurate?
- **Technical Notes** — Are there new gotchas from recent work that developers need to know?
  Check `CLAUDE.md` and recent commits for anything not yet in README.

Only flag items where there is a concrete, verifiable difference. Do not flag style preferences
or subjective improvements.

---

## Step 3: Update README.md

If drift was found in Step 2, update the relevant sections using Edit (not Write).
Preserve the existing structure and tone. Rules:

1. **Only change sections with verified drift.** Do not rewrite sections that are accurate.
2. **Keep it concise.** README is a developer reference, not a tutorial.
3. **Match existing style.** Use the same heading levels, formatting, and voice.
4. **No trailing commas** in any code examples.
5. **Do not add emojis.**
6. **Do not touch the License section.**

If no drift was found, do nothing. A no-op run is a successful run.

---

## Step 4: Log result

Write a brief summary to stdout:
- If changes were made: list which sections were updated and why.
- If no changes: "README.md is up to date."

---

## Constraints

- Work silently. Do not produce conversational output.
- Only modify `README.md`. Do not modify any other files.
- Do not add new sections to README — only update existing ones.
  If something important has no home, add it to Technical Notes.
- Be conservative. When in doubt, leave it alone.
