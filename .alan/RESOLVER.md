# Alan Capability Resolver

Read this file before acting. It routes user intent to the correct Alan capability (agent, command, or skill). When a trigger matches, open the referenced capability file before responding.

<!-- alan:generated -->

## Always-on

<!--
Alan's always-on behavior is handled by Claude Code hooks (SessionStart, UserPromptSubmit,
Stop, PreCompact) rather than by routed capability files. There are intentionally no rows
in this section — if you're looking for memory injection or signal detection, those live
in src/hooks/ and ~/.claude/hooks/, not under templates/.
-->

<!-- alan:routes -->

## Codebase

| Trigger | Capability |
|---------|------------|
| "review this PR" / "review this code change" / "code quality check" | `agents/alan-code-reviewer.md` |
| "analyze this code" / "trace how X works" / "explain the data flow" | `agents/alan-codebase-analyzer.md` |
| "find where X is implemented" / "where does X live" | `agents/alan-codebase-locator.md` |
| "find similar implementations" / "show me examples of X pattern" | `agents/alan-codebase-pattern-finder.md` |
| "resolve merge conflict" / "fix conflict in X" | `agents/alan-conflict-resolver.md` |
| "security review" / "check for security issues" / "audit this change" | `agents/alan-security-reviewer.md` |

## Research

| Trigger | Capability |
|---------|------------|
| "synthesize these research findings" / "turn these findings into a research doc" | `agents/alan-research-synthesizer.md` |
| "what's actionable in this research doc" / "extract decisions from this plan" | `agents/alan-thoughts-analyzer.md` |
| "find prior research on X" / "what have I written about X" / "find notes on X" | `agents/alan-thoughts-locator.md` |
| "search the web for X" / "find docs on X" / "look up X online" | `agents/alan-web-search-researcher.md` |

## Planning

| Trigger | Capability |
|---------|------------|
| "apply these plan-verification fixes" / "turn feedback into plan edits" | `agents/alan-plan-change-synthesizer.md` |
| "critique this plan" / "is this plan ready to implement" | `agents/alan-plan-critic.md` |
| "write a plan for X" / "draft an implementation plan (content production)" | `agents/alan-plan-synthesizer.md` |
| "turn this idea into a PRD" / "/alan:brainstorm" | `commands/alan-brainstorm.md` |
| "let's talk through this idea" / "discuss an approach" / "/alan:discuss" | `commands/alan-discuss.md` |
| "plan this feature" / "/alan:plan (interactive plan authoring)" | `commands/alan-plan.md` |
| "research and write a doc" / "/alan:research" | `commands/alan-research.md` |

## Pipeline

| Trigger | Capability |
|---------|------------|
| "execute phase N of a plan (foreman-dispatched worker)" | `agents/alan-executor.md` |
| "implement this plan" / "/alan:implement <plan>" | `commands/alan-implement.md` |
| "update this plan with the verification feedback" / "/alan:iterate" | `commands/alan-iterate.md` |
| "review the implementation" / "/alan:review" | `commands/alan-review.md` |
| "batch-triage for-review items" / "/alan:sprint" | `commands/alan-sprint.md` |
| "verify this plan is ready" / "/alan:verify" | `commands/alan-verify.md` |

## Operations

| Trigger | Capability |
|---------|------------|
| "check Claude Code release notes" / "/alan:cc-version-check" | `commands/alan-cc-version-check.md` |
| "clean up stranded worktrees" / "/alan:cleanup" | `commands/alan-cleanup.md` |
| "initialize Alan for this project" / "/alan:init" | `commands/alan-init.md` |
| "run a self-review" / "periodic health check" / "/alan:introspect" | `commands/alan-introspect.md` |
| "what's in the job queue" / "show pending jobs" / "/alan:jobs" | `commands/alan-jobs.md` |
| "reboot Alan" / "reload skills" / "/alan:reboot" | `commands/alan-reboot.md` |
| "improve a prompt" / "run eval loop" / "/alan:self-improve" | `commands/alan-self-improve.md` |
| "how's Alan doing" / "what's the system state" / "/alan:status" | `commands/alan-status.md` |
| "investigate a triage job" / "/alan:triage" | `commands/alan-triage.md` |

## Memory

| Trigger | Capability |
|---------|------------|
| "find prior context about X from Alan's memory (subagent-friendly)" | `agents/alan-memory-locator.md` |
| "search memory for X" / "what do we know about X" | `skills/alan-memory-search/SKILL.md` |
| "summarize parent job reports for this job" | `agents/alan-report-context.md` |
| "remind me to X" / "add a todo" / "/alan:add-todo" | `commands/alan-add-todo.md` |
| "morning brief" / "what's the plan for today" / "/alan:brief" | `commands/alan-brief.md` |
| "what todos do I have" / "/alan:check-todos" | `commands/alan-check-todos.md` |
| "consolidate today's memory" / "/alan:consolidate" | `commands/alan-consolidate.md` |
| "hand off this interactive work to a background job" / "/alan:handoff" | `commands/alan-handoff.md` |
| "learn this project" / "bootstrap knowledge files" / "/alan:learn" | `commands/alan-learn.md` |
| "peek at a running job's transcript" / "/alan:peek" | `commands/alan-peek.md` |
| "recap what we did" / "summarize recent work" / "/alan:recap" | `commands/alan-recap.md` |

## Skills

| Trigger | Capability |
|---------|------------|
| "search the web semantically" / "find similar pages" / "fetch URL content" | `skills/alan-exa-search/SKILL.md` |
| "create a GitHub issue" / "move this to the project board" / "milestones and issues" | `skills/alan-github/SKILL.md` |
| "build a PRD (invoked by brainstorm)" | `skills/alan-prd-builder/SKILL.md` |
| "decompose this PRD into tasks (invoked by brainstorm)" | `skills/alan-task-builder/SKILL.md` |

## Meta

| Trigger | Capability |
|---------|------------|
| "run the benchmark autoresearch loop" / "/alan:bench-loop" | `commands/alan-bench-loop.md` |
| "calibrate the templates for this project" / "/alan:calibrate" | `commands/alan-calibrate.md` |
| "process a queued background job (dispatcher-invoked)" | `commands/alan-process-job.md` |

<!-- /alan:routes -->

## Project-specific routes

| Trigger | Capability |
|---------|------------|

<!-- Populated by `/alan:calibrate` with rules specific to this project. -->


## Disambiguation rules

1. Prefer the most specific match — a `/alan:*` command trigger always wins over a generic description of what it does.
2. When the user mentions code, files, or implementation details, prefer codebase agents (`alan-codebase-*`, `alan-code-reviewer`) over general-purpose commands.
3. When the user asks a factual question ("what do we know about X?", "what did we decide about Y?"), prefer the memory skill and memory agents over re-running research.
4. For any explicit `/alan:*` invocation, route directly to that command file — don't second-guess the user's named request.
5. When multiple capabilities plausibly fit and the choice matters, ask the user which one they mean before acting.

## Conventions

- Operational rules (TDD, boy-scout, lint/test order, note-taking) live in `.alan/CLAUDE.md`, not in individual capability files.
- Information-topology guidance (where a new piece of content belongs) lives in `.alan/_filing-rules.md`.
- Calibration markers (`{{calibrate:...}}`) belong only in CLAUDE.md and RESOLVER.md; individual agents, commands, and skills must not embed them.
