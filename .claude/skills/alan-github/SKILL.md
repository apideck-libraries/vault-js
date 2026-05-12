---
name: alan-github
description: Manage GitHub Issues and Projects V2 boards via the gh CLI. All scripts output JSON to stdout.
allowed-tools:
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-auth.js:*)
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/create-issue.js:*)
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/update-status.js:*)
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/create-milestone.js:*)
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/close-issue.js:*)
section: "Skills"
triggers:
  - "create a GitHub issue"
  - "move this to the project board"
  - "milestones and issues"
---

# GitHub Projects Skill

Manage GitHub Issues and Projects V2 boards via the `gh` CLI. All scripts output JSON to stdout.

## Prerequisites

Run the auth check before first use:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/check-auth.js
```

If it reports missing `project` scope, run the fix command it provides.

## Scripts

### check-auth.js

Check if `gh` CLI has the required `project` scope in keyring auth.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/check-auth.js
```

Output: `{ "ok": true|false, "message": "...", "fix?": "..." }`

### create-issue.js

Create a GitHub issue and optionally add it to a project board.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/create-issue.js \
  --title "Issue title" \
  --body "Issue body" \
  --repo "owner/repo" \
  --project 1 \
  --owner "owner" \
  --status "Research" \
  --milestone "v1.0" \
  --labels "bug,priority"
```

Required: `--title`, `--body`, `--repo`
Optional: `--project`, `--owner`, `--status`, `--milestone`, `--labels`

Output: `{ "url": "...", "number": 42, "projectItemId?": "..." }`

### update-status.js

Update the status column of a project board item and optionally add a comment.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/update-status.js \
  --url "https://github.com/owner/repo/issues/42" \
  --project 1 \
  --owner "owner" \
  --status "Implement" \
  --comment "Moving to implementation"
```

Required: `--url`, `--project`, `--owner`, `--status`
Optional: `--comment`

Output: `{ "success": true, "itemId": "..." }`

### create-milestone.js

Create a GitHub milestone.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/create-milestone.js \
  --title "v1.0" \
  --repo "owner/repo" \
  --description "First release"
```

Required: `--title`, `--repo`
Optional: `--description`

Output: `{ "number": 1, "url": "...", "title": "..." }`

### close-issue.js

Close a GitHub issue with an optional comment.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/close-issue.js \
  --url "https://github.com/owner/repo/issues/42" \
  --comment "Resolved in PR #50"
```

Required: `--url`
Optional: `--comment`

Output: `{ "success": true, "url": "..." }`
