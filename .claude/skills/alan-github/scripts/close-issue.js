"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/skills/alan-github/close-issue.ts
var close_issue_exports = {};
__export(close_issue_exports, {
  main: () => main
});
module.exports = __toCommonJS(close_issue_exports);

// src/skills/alan-github/gh-runner.ts
var import_child_process = require("child_process");

// src/logger.ts
var LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4
};
function currentLevel() {
  const raw = (process.env.ALAN_LOG_LEVEL ?? "info").toLowerCase();
  return LEVELS[raw] ?? LEVELS.info;
}
function createLogger(prefix) {
  const write = (level, msg) => {
    if (currentLevel() <= level) {
      process.stderr.write(`${prefix}: ${msg}
`);
    }
  };
  return {
    debug: (msg) => write(LEVELS.debug, msg),
    info: (msg) => write(LEVELS.info, msg),
    warn: (msg) => write(LEVELS.warn, msg),
    error: (msg) => write(LEVELS.error, msg)
  };
}

// src/skills/alan-github/gh-runner.ts
var log = createLogger("gh-runner");
var BOARD_STATUS = {
  QUEUE: "Queue",
  DONE: "Done",
  REVIEW: "Review"
};
function runGh(args) {
  try {
    return (0, import_child_process.execFileSync)("gh", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
  } catch (err) {
    const stderr = err && typeof err === "object" && "stderr" in err ? String(err.stderr) : err instanceof Error ? err.message : String(err);
    throw new Error(stderr);
  }
}
function runGhJson(args) {
  const output = runGh(args);
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Failed to parse gh JSON output: ${output.slice(0, 200)}`);
  }
}
function getProjectNodeId(opts) {
  try {
    const data = runGhJson([
      "project",
      "view",
      String(opts.projectNumber),
      "--owner",
      opts.owner,
      "--format",
      "json"
    ]);
    return data.id ?? null;
  } catch (err) {
    log.warn(`failed to get project node ID: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
function findProjectItem(opts) {
  try {
    const data = runGhJson([
      "project",
      "item-list",
      String(opts.projectNumber),
      "--owner",
      opts.owner,
      "--limit",
      "1000",
      "--format",
      "json"
    ]);
    if (data.items.length >= 1e3) {
      log.warn("findProjectItem: result set at limit (1000) \u2014 item may be beyond fetch window");
    }
    const item = data.items.find((i) => i.content?.url === opts.issueUrl);
    return item?.id ?? null;
  } catch (err) {
    log.warn(`failed to find project item: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
function setProjectItemStatus(opts) {
  let fieldId;
  let optionId;
  let nodeId;
  if (opts.statusFieldId && opts.statusOptions && opts.projectNodeId) {
    fieldId = opts.statusFieldId;
    const cached = opts.statusOptions[opts.status];
    if (!cached) {
      throw new Error(`Status column "${opts.status}" not found in cached options`);
    }
    optionId = cached;
    nodeId = opts.projectNodeId;
  } else {
    const fields = runGhJson([
      "project",
      "field-list",
      String(opts.projectNumber),
      "--owner",
      opts.owner,
      "--format",
      "json"
    ]);
    const statusField = fields.fields.find((f) => f.name === (opts.fieldName ?? "Status"));
    const option = statusField?.options?.find((o) => o.name === opts.status);
    if (!statusField || !option) {
      throw new Error(`Status column "${opts.status}" not found in project fields`);
    }
    fieldId = statusField.id;
    optionId = option.id;
    const resolved = getProjectNodeId({
      projectNumber: opts.projectNumber,
      owner: opts.owner
    });
    if (!resolved) {
      throw new Error(`Could not resolve project node ID for project ${opts.projectNumber}`);
    }
    nodeId = resolved;
  }
  runGh([
    "project",
    "item-edit",
    "--id",
    opts.itemId,
    "--field-id",
    fieldId,
    "--single-select-option-id",
    optionId,
    "--project-id",
    nodeId
  ]);
}

// src/skills/alan-github/close-issue.ts
function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!flag || !value) continue;
    if (flag === "--url") {
      args.url = value;
      i++;
    } else if (flag === "--comment") {
      args.comment = value;
      i++;
    } else if (flag === "--project") {
      args.project = parseInt(value, 10);
      i++;
    } else if (flag === "--owner") {
      args.owner = value;
      i++;
    }
  }
  if (!args.url) {
    console.error(
      "Usage: close-issue --url <issue-url> [--comment <c>] [--project <n> --owner <o>]"
    );
    process.exit(1);
  }
  return args;
}
function main() {
  const args = parseArgs();
  let commentError;
  if (args.comment) {
    try {
      runGh(["issue", "comment", args.url, "--body", args.comment]);
    } catch (err) {
      commentError = err instanceof Error ? err.message : String(err);
    }
  }
  try {
    runGh(["issue", "close", args.url]);
  } catch (err) {
    process.stdout.write(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }) + "\n"
    );
    process.exit(1);
  }
  let boardError;
  if (args.project && args.owner) {
    try {
      const itemId = findProjectItem({
        projectNumber: args.project,
        owner: args.owner,
        issueUrl: args.url
      });
      if (itemId) {
        setProjectItemStatus({
          itemId,
          projectNumber: args.project,
          owner: args.owner,
          status: BOARD_STATUS.DONE
        });
      }
    } catch (err) {
      boardError = err instanceof Error ? err.message : String(err);
    }
  }
  const result = { success: true, url: args.url };
  if (boardError) result.boardError = boardError;
  if (commentError) result.commentError = commentError;
  process.stdout.write(JSON.stringify(result) + "\n");
}
if (require.main === module) {
  main();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
