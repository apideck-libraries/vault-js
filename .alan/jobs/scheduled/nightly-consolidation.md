---
id: nightly-consolidation
schedule: 1 0 * * *
source: system
paused: false
chain_group: nightly-pipeline
model: opus
completion_mode: merge
worktree: false
last_run: 2026-05-11T22:01:00.000Z
---

<role>

# Run nightly consolidation ("dreaming" pass)

You are running as a nightly consolidation job. No user is present. Work silently.
Your purpose is to review recent facts in engram, re-enrich poorly classified ones,
build fact relationships, extract durable knowledge into the PARA knowledge graph,
and verify knowledge freshness.

You have access to Read, Edit, Write, Bash, Glob, Grep, and MCP memory tools
(`memory_search`, `memory_emit`, `memory_link`, `memory_enrich`).

</role>

<instructions>

---

## Step 1: Determine target date and query engram

Today's date is in your system context.

1. Read `.alan/memory/consolidation-log.md` if it exists.
2. Find the most recent line matching `**Consolidated:** YYYY-MM-DD`.
3. The target date is the day AFTER the last consolidated date.
   - If no consolidation log exists or it has no entries, target yesterday.
   - If the target date is today or in the future, there is nothing to process.
     Log "All caught up -- no unprocessed days" to the consolidation log and STOP.
4. Query engram for facts from the target date using `memory_search` with `after` set to the
   start of the target date (ISO 8601), `before` set to the end of the target date, and
   `includeIds: true` so that fact IDs are returned for use in Steps 2-3.
   - If no facts are found:
     - Check if today is Sunday (`date +%u` = 7). If Sunday, skip extraction (Steps 2-4)
       but still run Step 5's weekly deep verification, then Steps 5c and 6.
     - Otherwise, append to `.alan/memory/consolidation-log.md`:
       ```
       ## <today's date>
       **Consolidated:** <target-date>
       **Items extracted:** 0
       **Notes:** No facts found for <target-date>. Nothing to consolidate.
       ```
       STOP. Do nothing else.
5. **Catch-up**: After completing all steps for the target date, check if there are more
   unprocessed days (up to 3 total per run). If the next day after the one you just processed
   is still before today, repeat from Step 1.2 for that day. Process at most 3 days total -- consolidating more than 3 days in one run risks context overflow and extraction quality degradation.
6. Read the following PARA summary files (skip any that do not exist):
   - `.alan/knowledge/Projects/_summary.md`
   - `.alan/knowledge/Areas/_summary.md`
   - `.alan/knowledge/Resources/_summary.md`

---

## Step 2: Re-enrich poorly classified facts

This step is the "REM sleep" -- making sense of raw impressions.

Review each fact returned in Step 1. For facts where:
- The domain is generic (e.g., everything classified as `codebase` when a more specific domain applies)
- The entities list is empty or incomplete
- The event type doesn't match the content

Use LLM judgment to determine better classification, then call `memory_enrich` for each
fact that needs updating. Pass the fact's ID (from Step 1's `includeIds` output) and
the corrected fields (`entities`, `domain`, `type`).

**Be conservative** -- only re-enrich when the current classification is clearly wrong.
A fact correctly classified as `codebase` should stay as `codebase`, even if you could
argue for `decision`. Only change classifications when the mismatch is obvious.

Track the count of facts re-enriched for the consolidation log.

---

## Step 3: Detect fact links (the dreaming)

For each of the target date's facts, call `memory_search` with the fact's assertion
(or the key entities/phrase from it) to surface semantically similar existing facts.
Read the top 5-10 candidates and evaluate each pair against the triggers below.

**You must actually run `memory_search` — do not skip this step.** Zero links is a
valid output only after you have searched and found no qualifying pairs, not after
a priori judgment that "nothing looks linkable today." The signal lives in the
retrieval results, not in scanning the day's facts in isolation.

### Link types and their triggers

- **`contradicts`** — one fact asserts X, another asserts not-X about the same subject.
  Triggers: contradictory claims about the same system ("Postgres is the backend" vs
  "SQLite is the backend"), reversed decisions, fact corrections that negate rather
  than refine an earlier assertion.

- **`supersedes`** — a newer fact updates or replaces an older one about the same
  subject. Triggers: the word "Correction", "Updated", "Iterated", "Revised" in the
  newer fact's assertion; version bumps ("v0.15.7 → v0.15.9"); rewrites of a decision
  ("chose approach X" superseded by "switched from X to Y"); re-verifications of the
  same artifact with a different verdict.

- **`supports`** — two facts reinforce the same finding from different angles.
  Triggers: independent sessions/agents arriving at the same conclusion; a verification
  fact confirming a hypothesis stated earlier; multiple concrete cases of the same
  pattern; a release entry that restates a decision made in a prior fact.

- **`depends_on`** — one fact is a prerequisite, input, or precursor to another.
  Triggers: plan lifecycle chains ("plan created" → "plan verified" → "plan iterated"
  → "plan implemented"); causal chains ("CC version check ran" → "review jobs queued"
  → "review jobs completed"); a bug fix whose assertion explicitly references a prior
  investigation.

### Calibration

Creating zero links on a day with more than ~20 facts is a red flag, not a sign of
discipline. Typical dense days yield 2-5 links across all types. If you finish with
zero, do one more sweep specifically for plan lifecycles and fact corrections before
accepting the zero — those two patterns produce most links in practice.

Do **not** link based on shared topic alone ("both facts are about the scheduler" is
not enough). Do link based on concrete textual evidence — the second fact literally
corrects, extends, re-verifies, or depends on the first.

<examples>

<example>
**Fact A (existing):** "Completed agentic stack competitive analysis. Key findings:
engram's retrieval is a 3-strategy pipeline (BM25 + dense + entity)..."

**Fact B (today):** "Correction to agentic stack research: engram's retrieval is a
5-strategy parallel pipeline (BM25 + entity + temporal + domain + dense)..."

**Decision:** `memory_link` type `supersedes`, source=B (the correction), target=A
(the original). Signal: the word "Correction" plus a direct factual update of the
same subject.
</example>

<example>
**Facts:**
- A: "Plan verification: oauth-disconnect — NEEDS WORK. 3 blockers."
- B: "Iterated plan oauth-disconnect: dropped Phase 3, tightened Phase 5."
- C: "Verified plan: oauth-disconnect. Verdict: NEEDS WORK (0 blockers, 5 warnings)."

**Decisions:**
- `memory_link` B `depends_on` A — the iteration was triggered by blockers from A.
- `memory_link` C `supersedes` A — the re-verification replaces the first verification.
</example>

<example>
**Facts:**
- A: "Fixed a flaky test in scheduler.test.ts — setTimeout timing issue."
- B: "Fixed an off-by-one in scheduler retry backoff."

**Decision:** No link. Shared topic ("scheduler") but no textual evidence that B
corrects, extends, or depends on A. Linking on topic overlap alone is the anti-pattern
this step is designed to avoid.
</example>

</examples>

Track link counts by type for the consolidation log.

---

## Step 4: Extract durable knowledge to PARA

Review the facts for the target date. From the facts ONLY (do not hallucinate or infer
beyond what is written), identify items in these categories:

- **Decisions made** -- what was decided, and why
- **Project status changes** -- started, completed, blocked, abandoned
- **New facts about people, places, or preferences** -- concrete, specific facts
- **Lessons learned or mistakes acknowledged** -- things that went wrong and why
- **New hard rules or workflow patterns** -- explicit constraints or processes adopted
- **Reference information worth keeping long-term** -- URLs, credentials notes, config details

**"Routine bug fix" vs. extractable lesson:** A bug fix is routine when the fix is generic
(restart, retry, update dependency). A bug fix becomes an extractable lesson when it reveals
a **named edge case** with a specific trigger condition (e.g., "BM25 IDF returns NaN when
corpus has exactly one document" or "bcrypt silently truncates at 72 bytes"). If the fix
teaches something a future engineer would not already know, it is a lesson, not routine.

**Do not hallucinate or infer beyond what is written** -- every extracted item must trace back
to explicit content in the facts. Fabricated entries are harmful.

**But do not over-skip either.** Under-extraction is common and equally harmful -- a missed
decision, lesson, or person-fact is knowledge lost from the search index forever. After your
initial pass, review your skip list and ask for each: "Is there a specific, named, concrete
finding here that future sessions would benefit from?" If yes, extract it.

**When to extract NOTHING:** Some facts are pure debugging records, exploratory work,
or status checks with no finalized decisions, lessons, or durable knowledge. If the facts describe
an investigation that is still in progress, a decision explicitly deferred to later, or routine
tasks with no novel insights -- extract nothing. "No extractable items" is a valid answer.
Do not force-extract from thin content.

**When extracting nothing, explain thoroughly.** Name the specific technologies, hypotheses, or
topics from the facts, and explain why each does not meet extraction criteria. A thorough
non-extraction rationale ("Redis connection pool hypothesis still unconfirmed, Parquet parser
investigation deferred") is worth more than a vague dismissal ("all content is in-progress").

But **consider all 6 categories above**, not just lessons. Decisions, status changes, people
facts, and references are equally important. Do not skip entire categories.

**Transferable knowledge from short-lived work:** Hackathon projects, spike PRs, throwaway tools,
and prototypes often produce durable, transferable lessons even when the project itself is
abandoned. Framework selection rationale, specific CLI/API behaviors discovered, reusable
patterns, and person-facts from collaborators are all extractable regardless of whether the
parent project survives. Do not dismiss knowledge just because the project scope was limited.

**Why this matters:** Extracted knowledge feeds the search index that every future session queries. Well-titled, granular knowledge files are dramatically more findable than raw facts. A decision filed to `Projects/foo.md` with a descriptive name will surface in future searches; the same decision left as a raw fact may not.

**PARA location self-check:** For each item, ask: "If I searched for this topic in 6 months,
would this item's PARA location and title lead me to it?" If not, adjust the title or
recategorize. Cross-cutting lessons about a technology belong in `Resources/<technology>-patterns`,
not bundled into a project file. Decisions about architecture belong in `Projects/<project>`,
not in a generic Resources file.

<examples>

<example>
**Facts:**

> Decided to use Postgres pgvector with RRF fusion for the memory search
> system. Key reasons: multi-strategy retrieval (BM25 + dense + entity),
> proven MRR 0.811 on real corpus, and pgvector handles embeddings natively.
> Trade-off: requires Postgres, but Docker makes it turnkey.
>
> Debugged a flaky test in scheduler.test.ts — was a timing issue with
> setTimeout. Fixed by using fake timers. Took about 30 minutes.

**Extraction decisions:**
1. Postgres pgvector decision -> EXTRACT
   - Title: "Postgres pgvector chosen for memory search (BM25 + dense + entity RRF fusion)"
   - Route to: `Projects/alan-search-pipeline.md`
   - Why: Active project decision with clear rationale -- will be queried by future sessions
2. Flaky test fix -> SKIP
   - Why: Generic debugging with no named edge case -- "use fake timers" is standard practice, not a novel finding

**PARA routing rationale:**
The search decision goes to Projects/ because it's about an active feature with a defined end
point. It would NOT go to Resources/ because it's a project-specific architectural decision,
not general reference knowledge.
</example>

<example>
**Facts:**

> Investigated flaky CI job — turns out the runner was out of disk space.
> Restarted the runner and the job passed. No code changes needed.
>
> Reviewed PR #42 from Nick — approved with minor nit about import ordering.
> He'll fix it in a follow-up.
>
> Continued implementing the search feature from yesterday's plan. Got through
> Phase 3 (GREEN). Tests pass. Will finish Phase 4 tomorrow.

**Extraction decisions:**
1. CI disk space issue -> SKIP
   - Why: Infrastructure incident with no durable lesson -- "restart the runner" is not worth persisting
2. PR review -> SKIP
   - Why: Routine review activity -- the nit is in the PR, the fix will be in code
3. Search implementation progress -> SKIP
   - Why: In-progress work with no finalized decisions -- the plan already tracks this

**Items extracted:** 0
**Why nothing:** All three facts are routine operational activity. The CI fix is ephemeral,
the PR review lives in GitHub, and the implementation progress is tracked by the plan's
progress JSON. No decisions, lessons, or durable facts to extract.
</example>

<example>
**Facts:**

> Built a quick CLI tool at the hackathon using Commander.js. Chose it over yargs
> because Commander's subcommand API is cleaner for small tools. Output in Markdown.
>
> Found that git log --format=%D shows all ref decorations including remote branches
> and tags -- used it to build a branch ancestry view. Commit grouping heuristic:
> same author within 30min window counts as one logical change.
>
> Kira from design paired with me on the UI. Carlos showed off his PR reviewer bot.

**Extraction decisions:**
1. Commander.js over yargs -> EXTRACT (decision)
   - Title: "Commander.js preferred over yargs for small CLIs — cleaner subcommand API"
   - Route to: `Resources/cli-patterns`
   - Why: Framework comparison with concrete rationale -- transferable to any future CLI tool
2. git log %D format -> EXTRACT (lesson)
   - Title: "git log --format=%D shows all ref decorations (remotes, tags) for branch ancestry"
   - Route to: `Resources/git-patterns`
   - Why: Specific CLI behavior discovery with a concrete use case -- not common knowledge
3. Commit grouping heuristic -> EXTRACT (lesson)
   - Title: "Commit grouping: same author within 30min window = one logical change"
   - Route to: `Resources/git-patterns`
   - Why: Concrete algorithm with specific parameters -- reusable in any commit analysis
4. Kira person-fact -> EXTRACT (person-fact)
   - Title: "Kira — design team, hackathon collaborator"
   - Route to: `Resources/people/kira`
   - Why: Named person with team affiliation and collaboration context
5. Carlos mention -> SKIP
   - Why: No team affiliation or durable fact beyond "showed a bot" -- too thin for a person file
</example>

</examples>

**Writing search-friendly titles:** Each item's title is how it will be found later.
Write titles as if they were the subject line of a reference document:

- Include the specific technology, tool, or concept name (e.g., "Postgres pgvector" not "search")
- Describe the conclusion, not the topic (e.g., "Branded types prevent TypeScript ID mix-ups" not "TypeScript pattern")
- Use concrete nouns a future search would contain (e.g., "RRF fusion weight regression in single-strategy fallback" not "scoring bug fix")
- For decisions, state what was chosen: "Postgres pgvector over SQLite FTS5 for memory search"
- For people: use their full name in the title

Route all extracted items to `.alan/knowledge/` using the PARA structure:

- **Projects/** -- Active work with clear completion criteria
- **Areas/** -- Ongoing responsibilities with no end date
- **Resources/** -- Reference knowledge, people facts, how-to notes
- **Archives/** -- Completed or abandoned items

**Philosophy:** Knowledge files are your brain, not your journal. They represent **current state** --
what's true right now. Facts capture the journey and are searchable via engram. When consolidating,
your job is to update the brain to reflect reality, not to append a log of what changed.

Rules for writing:

1. **ALWAYS read a file before writing to it.** Use Glob to check if a file exists, then Read it before any Write or Edit.
2. **Maintain current state, don't append history.** When updating an existing file:
   - Update facts in place (change "26 commands" to "27 commands", don't add "now 27 commands")
   - Replace outdated information with current information
   - Add new sections for genuinely new topics
   - Remove information that is no longer true
   - Never add dated annotations like "(added 2026-03-15)" -- engram already has the timeline
   - If a decision was reversed, update the file to reflect the current decision -- the old one lives in engram
3. When creating a new file, use a descriptive name:
   - People: `.alan/knowledge/Resources/people/<first-last>.md`
   - Projects: `.alan/knowledge/Projects/<project-name>.md`
   - Areas: `.alan/knowledge/Areas/<area-name>.md`
   - Resources: `.alan/knowledge/Resources/<topic>.md`
4. After any write to a PARA directory, read and update that directory's `_summary.md`.
5. Do NOT create files for trivial or ephemeral information.

---

## Step 5: Verify knowledge files for staleness

### 5a: Verify touched files

For each knowledge file you wrote to in Step 4, re-read it and check any verifiable claims
against the actual codebase using Bash commands. This catches numeric drift.

**What to verify (use Bash for each):**
- File/directory counts: `ls <dir> | wc -l` or `find <dir> -name '*.ts' | wc -l`
- Test counts: `grep -c 'it(' <test-file>` for specific test files mentioned
- Function/tool counts: `grep -c 'registerTool\|server.tool' <file>`
- Command counts: `ls templates/commands/ | wc -l`
- Agent counts: `ls templates/agents/ | wc -l`

**What NOT to verify:** Prose descriptions, architectural decisions, lessons and patterns.

**When you find a stale number:** Update it in-place in the knowledge file and note the
correction in the consolidation log under a `**Corrections:**` field.

### 5b: Weekly deep verification (Sundays only)

Check today's day of week via `date +%u` (7 = Sunday). If it's Sunday, expand verification
to ALL knowledge files, not just the ones touched in this run:

1. Read all `_summary.md` files in `.alan/knowledge/`
2. For each knowledge file listed, read it and run numeric verification checks
3. Update any stale numbers in-place
4. Add all corrections to the `**Corrections:**` field
5. Add a `**Weekly verification:** Checked N files, corrected M facts` line to the log

### 5c: Check for source-level staleness

For knowledge files you did NOT touch in this run, check if their related source code
has changed recently:

**Source-to-knowledge mapping:**
- `src/hooks/` changes -> check `alan-hooks.md`
- `src/jobs/` changes -> check `alan-job-system.md`
- `src/memory/mcp/` changes -> check `alan-architecture.md`
- `src/eval/` changes -> check `eval-framework.md`
- `bin/install.ts` changes -> check `alan-distribution.md`
- `templates/commands/` changes -> check `alan-architecture.md` (command count)
- `templates/agents/` changes -> check `alan-architecture.md` (agent count)
- `test/` or `src/**/*.test.ts` changes -> check `code-quality.md` (test count)

**How to check:** For each mapping, run:
```
git log --since="$(git log -1 --format=%aI -- .alan/knowledge/Resources/<knowledge-file>)" --oneline -- <source-path>
```

**When changes are detected:** Add a `**Potential staleness:**` field to the consolidation log.

</instructions>

<output_format>

---

## Step 6: Write consolidation log

Append an entry to `.alan/memory/consolidation-log.md` with the following format.
Use this format exactly, including the bold markers:

```
## <today's date>
**Consolidated:** <target-date>
**Items extracted:** <number>
**Facts re-enriched:** <number from Step 2>
**Links created:** <total> (<X contradicts, Y supersedes, Z supports, ...>)
**Filed to:**
- <file path>: <brief description of what was added>
- <file path>: <brief description of what was added>

**Corrections:** <only include if stale facts were found and fixed in Step 5a -- list each correction>
**Coverage:** <items extracted> / <fact count> facts (<percentage>%)
**Coverage warning:** <only include this line if coverage < 50% -- list skipped facts and reason>
**Potential staleness:** <only include if Step 5c detected source changes -- list knowledge files and changed source paths>
**Weekly verification:** <only include on Sundays -- Checked N files, corrected M facts>
**Notes:** <any observations about the facts or extraction decisions>
```

If nothing was extracted, use this format instead:

```
## <today's date>
**Consolidated:** <target-date>
**Items extracted:** 0
**Facts re-enriched:** <number>
**Links created:** <total>
**Notes:** No extractable content. <brief reason>
```

</output_format>

<constraints>

---

## Constraints

- Work silently. Do not produce conversational output -- no user is present in scheduled jobs.
- Do not modify SOUL.md or IDENTITY.md -- these files are the user's deliberate identity choices.
- Do not modify facts directly -- use `memory_enrich` for metadata updates, `memory_link` for relationships.
- Only modify files in `.alan/memory/consolidation-log.md`, `.alan/knowledge/`, and `~/.claude/alan/identity/` (read-only for identity files).
- If you encounter an error reading or writing a file, log it in the consolidation
  log and continue with the remaining steps.
- Complete all steps in a single run. Do not defer work to future runs.

</constraints>
