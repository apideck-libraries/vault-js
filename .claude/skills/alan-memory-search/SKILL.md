---
name: alan-memory-search
description: Search Alan's indexed memory via engram's daemon for knowledge files, session context, and facts.
allowed-tools:
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/search.js:*)
section: "Memory"
triggers:
  - "search memory for X"
  - "what do we know about X"
---

# Memory Search Skill

Search Alan's indexed memory (knowledge files, session context, facts) via the search daemon.

## Usage

Call the search script with a focused query and optional max results:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/search.js "query terms" [maxResults]
```

- First argument: search query (required)
- Second argument: max results to return (optional, default 5)
- Output: JSON array of results to stdout

Each result object has these fields:
- `collection`: source collection (e.g. `knowledge`, `session_context`)
- `title`: document title or filename
- `excerpt`: relevant text excerpt
- `score`: relevance score (higher is better)

## Behavior

- Returns `[]` if the search daemon is not running (graceful degradation)
- Returns `[]` on any connection error or timeout
- Hyphens in queries are automatically sanitized (query parser compatibility)
- 5-second timeout on connection and response
