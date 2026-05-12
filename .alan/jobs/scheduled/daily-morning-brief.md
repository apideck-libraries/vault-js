---
id: daily-morning-brief
schedule: 0 7 * * *
source: system
paused: false
chain_group: nightly-pipeline
chain_after: daily-docs-sync
model: sonnet
completion_mode: merge
worktree: false
scope: alan-only
last_run: 2026-05-12T05:00:00.000Z
---

<role>

# Generate Morning Brief

You are running as a daily scheduled job. No user is present. Work silently.

Your purpose: generate `.alan/MORNING_BRIEF.md` as a scannable dashboard summarizing overnight activity, pending work, and review items.

</role>

<instructions>

## Steps

### 1. Determine Today's Date

Use the current date in YYYY-MM-DD format for the brief header and engram queries. Compute yesterday's date as well.

### 2. Query Engram for Recent Activity

Query engram via `memory_search` for facts from yesterday and today. This is where overnight activity lives.

From the returned facts, extract these patterns:

**Job completions** — entries matching this structure:
```
Job completed: <job-name>
Goal: <description>
Resolution: <summary>
```
Each job completion tells you what ran overnight and what happened. Use the job name and a one-line summary of the resolution.

**CC version changes** — lines containing `CC version change detected:` or `Claude Code updated:` with version numbers.

**Auto-merged changes** — look for job completions that merged changes (consolidation knowledge updates, readme syncs, code changes). Any job completion that mentions merging, committing, or updating files counts here. If a job appears in Auto-Merged Changes, don't duplicate it in Overnight Job Results.

If no facts are found, all activity-derived sections will show "- No movement".

### 3. Scan Todos

Use the Glob tool to find files:

- `thoughts/todos/for_review/*.md` — read each file, extract the `title` field from YAML frontmatter
- `thoughts/todos/pending/*.md` — read each file, extract the `title` field AND the `files:` block list from YAML frontmatter. For each path listed under `files:`, call `Glob <path>` (the literal path, not a glob expression — Glob returns the path if it exists, empty array if not). Collect any paths that return at least one match into a `possiblyResolved` list keyed by todo filename. Skip the todo entirely if `files: []` or `files:` is absent — introspect-authored todos always have `files: []` and cannot be cross-checked this way, so silently omitting them avoids false-negative noise.

### 4. Write the Brief

Write `.alan/MORNING_BRIEF.md` using the Write tool with this exact format:

```markdown
# Morning Brief — YYYY-MM-DD

## Auto-Merged Changes
- <one-line per code merge from job completions — job name + what changed>
- No movement

## CC Version Changes
- <version change entries from facts — old -> new + summary>
- No movement

## For Review
- <title from each thoughts/todos/for_review/*.md file — include filename>
- No movement

## Pending Todos
- <title from each thoughts/todos/pending/*.md file — include filename> — [possibly resolved: <comma-separated matched paths>]
- No movement

## Overnight Job Results
- <one-line per "Job completed:" entry from facts — job name: resolution summary>
- No movement
```

</instructions>

<constraints>

### Rules

- All five section headings MUST always be present -- the SessionStart hook injects the brief into context and parses by heading; missing headings cause partial injection.
- Sections with no content show "- No movement" as the only bullet -- this distinguishes "nothing happened" from "section was skipped"; the user needs to know both.
- Date header format must be exactly `# Morning Brief — YYYY-MM-DD` (the SessionStart hook parses this).
- Keep it scannable: one bullet per item, no multi-line entries -- the brief is read in the first 10 seconds of a session; dense entries slow comprehension.
- Replace YYYY-MM-DD with today's actual date.
- Job resolution summaries should be one sentence max — engram has full details.
- The ` — [possibly resolved: ...]` suffix on a Pending Todos bullet is conditional: include it only when Step 3 produced at least one matched path for that todo. Omit the suffix entirely (no empty brackets) when the `possiblyResolved` list for that todo is empty or the todo was skipped at Step 3.

## Constraints

- Work silently. Do not produce conversational output -- no user is present in scheduled jobs; conversational output is wasted tokens.
- Do not use AskUserQuestion or any interactive tools -- these would block indefinitely with no user to respond.
- Do not invoke slash commands -- the brief is a leaf task; triggering pipeline commands would cause unexpected side effects.
- Only use Read, Write, and Glob tools -- this restricts the job to observation and file-writing; destructive or interactive tools are inappropriate for background jobs.

</constraints>
