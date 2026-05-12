---
name: alan-exa-search
description: AI-native web search with semantic understanding, domain filtering, and content retrieval. Requires EXA_API_KEY.
allowed-tools:
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js:*)
section: "Skills"
triggers:
  - "search the web semantically"
  - "find similar pages"
  - "fetch URL content"
---

# Exa Search Skill

AI-native web search with semantic understanding, domain filtering, and content retrieval. Requires `EXA_API_KEY` in the environment.

## Mode 1: Search (Default)

```bash
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js "your search query" [options]
```

### Search Options

| Flag | Description | Default |
|------|-------------|---------|
| `--type` | Search type: `auto`, `neural`, `deep`, `fast` | `auto` |
| `--numResults` | Number of results to return | `10` |
| `--domains` | Comma-separated list of domains to include | none |
| `--excludeDomains` | Comma-separated list of domains to exclude | none |
| `--category` | Filter by category (see below) | none |

**Categories:** `company`, `research paper`, `news`, `pdf`, `personal site`, `financial report`, `people`

### Search Output

JSON array with content included by default:

```json
[
  {
    "title": "Page Title",
    "url": "https://example.com/page",
    "content": "Markdown content of the page..."
  }
]
```

### Search Examples

```bash
# Basic search
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js "TypeScript generics tutorial"

# Deep search for comprehensive results
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js "distributed systems consensus" --type deep --numResults 5

# Domain-filtered search
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js "API reference" --domains docs.example.com,api.example.com

# Filter by category
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js "machine learning" --category "research paper"
```

## Mode 2: Find Similar

Discover pages related to a known URL:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js --findSimilar "https://docs.example.com/api" [options]
```

| Flag | Description |
|------|-------------|
| `--findSimilar <url>` | URL to find similar pages for |
| `--excludeSourceDomain` | Exclude the source URL's domain from results |
| `--numResults <n>` | Number of results (default: 10) |
| `--domains <list>` | Comma-separated domain filter |

```bash
# Find related documentation pages
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js --findSimilar "https://docs.vendor.com/api/invoices" --numResults 25

# Find similar pages on OTHER sites
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js --findSimilar "https://docs.vendor.com" --excludeSourceDomain
```

Output: JSON array of `{ title, url }` objects (no content).

## Mode 3: Fetch Contents

Fetch markdown content for specific URLs:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/exa-search-cli.js --contents "https://url1.com,https://url2.com"
```

Output: JSON object mapping URL to markdown content:

```json
{
  "https://url1.com": "# Page Title\n\nMarkdown content...",
  "https://url2.com": "# Another Page\n\nMore content..."
}
```

## Error Handling

On error, writes `{ "error": "message" }` to stderr and exits with code 1.
