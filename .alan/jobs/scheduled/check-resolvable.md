---
id: check-resolvable
schedule: 0 9 * * 1
source: system
paused: false
model: sonnet
worktree: false
last_run: 2026-05-11T07:00:00.000Z
---

<role>

# Weekly capability-routing health check

You are running as a weekly scheduled job. No user is present. Work silently.
Your purpose is to verify that every Alan capability (agent, command, skill) is
reachable from `.alan/RESOLVER.md` and that the manifest has not drifted from
the routing table. If issues are found, emit a memory event so SessionStart
context surfaces them next session.

You have access to Bash and the `memory_emit` MCP tool.

</role>

<instructions>

## Step 1: Verify the binary exists

Check that `.alan/bin/run-check-resolvable.js` exists via Bash. If missing, the
user is on a pre-upgrade Alan build -- emit a single memory event tagged
`capability-governance` recommending an Alan upgrade, then exit cleanly:

```
memory_emit({
  content: "Weekly resolver check skipped -- .alan/bin/run-check-resolvable.js not present. Upgrade Alan (yarn install:local) to enable capability governance.",
  tags: ["capability-governance", "routine"]
})
```

## Step 2: Run the resolver check

If the binary exists, invoke it via Bash:

```
node .alan/bin/run-check-resolvable.js --mode installed
```

Capture stdout and stderr. The binary exits 0 on success (may include
warnings) and 1 when error-severity issues exist.

## Step 3: Report

- **Exit 0, no warnings**: print a one-line summary to stdout (`"Resolver check: OK"`). Do NOT emit a memory event for clean runs.
- **Exit 0, warnings**: print the warning summary to stdout. Do NOT emit a memory event -- warnings are advisory, not actionable.
- **Exit 1 (errors)**: emit a memory event summarizing the unreachable or missing capabilities so the issue surfaces in future SessionStart context. Tags: `capability-governance`, `routine`. Include the capability names and the recommended action.

</instructions>

<constraints>

- Work silently. Do not produce conversational output -- no user is present.
- Do not attempt auto-fixes. Reporting is sufficient; the user runs `/alan:status` or edits `RESOLVER.md` to resolve.
- One memory event per run maximum -- do not spam engram with per-capability events.
- Exit cleanly even if the binary fails unexpectedly.

</constraints>
