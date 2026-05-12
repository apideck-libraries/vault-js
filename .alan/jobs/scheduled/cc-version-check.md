---
id: cc-version-check
schedule: 0 8 * * *
source: system
paused: false
model: sonnet
completion_mode: merge
worktree: false
scope: alan-only
last_run: 2026-05-12T06:00:00.000Z
---

# CC Version Check

Check if Claude Code has been updated and analyze relevant changes.

## Steps

### 1. Get Current Version

Run `claude --version` via the Bash tool and extract the version number (e.g., `2.1.78`).

### 2. Read Stored Version

Read `.alan/cc-version.json` using the Read tool. Extract the `version` field. If the file doesn't exist, write it with the current version and stop (first run baseline).

### 3. Compare Versions

If the current version matches the stored version, stop — no update detected.

### 4. Update Stored Version

If versions differ, write the updated version to `.alan/cc-version.json`:

```json
{
  "version": "<current>",
  "last_checked": "<ISO timestamp>"
}
```

Write this BEFORE analyzing changes (prevents re-triggering on next run).

### 5. Analyze Changes

Run `/alan:cc-version-check <stored_version> <current_version>` via the Skill tool. This skill handles:
- Fetching release notes
- Identifying Alan-relevant changes
- Creating for_review jobs for items that need attention

## Constraints

- Do not produce conversational output.
- If `claude --version` fails, stop silently (CC binary may be updating).
- Always update cc-version.json before invoking the analysis skill.
- Regression benchmarking is manual — run `yarn bench:agents --agent <name> --compare` on demand if a CC change looks risky. Not auto-triggered per version bump.
