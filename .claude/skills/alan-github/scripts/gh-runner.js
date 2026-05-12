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

// src/skills/alan-github/gh-runner.ts
var gh_runner_exports = {};
__export(gh_runner_exports, {
  BOARD_STATUS: () => BOARD_STATUS,
  createIssueForJob: () => createIssueForJob,
  detectRepo: () => detectRepo,
  discoverFieldConfig: () => discoverFieldConfig,
  findProjectItem: () => findProjectItem,
  getProjectNodeId: () => getProjectNodeId,
  runGh: () => runGh,
  runGhJson: () => runGhJson,
  setProjectItemStatus: () => setProjectItemStatus
});
module.exports = __toCommonJS(gh_runner_exports);
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
function discoverFieldConfig(opts) {
  const fields = runGhJson([
    "project",
    "field-list",
    String(opts.projectNumber),
    "--owner",
    opts.owner,
    "--format",
    "json"
  ]);
  const statusField = fields.fields.find((f) => f.name === "Status");
  if (!statusField || !statusField.options) {
    throw new Error("Status field not found in project fields");
  }
  const statusOptions = {};
  for (const opt of statusField.options) {
    statusOptions[opt.name] = opt.id;
  }
  const projectNodeId = getProjectNodeId({
    projectNumber: opts.projectNumber,
    owner: opts.owner
  });
  if (!projectNodeId) {
    throw new Error(`Could not resolve project node ID for project ${opts.projectNumber}`);
  }
  return { statusFieldId: statusField.id, statusOptions, projectNodeId };
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
function detectRepo(projectRoot) {
  try {
    const output = (0, import_child_process.execFileSync)("git", ["-C", projectRoot, "remote", "-v"], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
    const match = output.match(/github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?(?:\s|$)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
function createIssueForJob(opts) {
  try {
    const firstLine = opts.goal.split("\n")[0] ?? opts.goal;
    const title = firstLine.length > 100 ? firstLine.slice(0, 100) + "..." : firstLine;
    const issueUrl = runGh([
      "issue",
      "create",
      "--repo",
      opts.repo,
      "--title",
      title,
      "--body",
      opts.goal
    ]);
    try {
      const addResult = runGhJson([
        "project",
        "item-add",
        String(opts.projectNumber),
        "--owner",
        opts.owner,
        "--url",
        issueUrl,
        "--format",
        "json"
      ]);
      try {
        setProjectItemStatus({
          itemId: addResult.id,
          projectNumber: opts.projectNumber,
          owner: opts.owner,
          status: BOARD_STATUS.QUEUE
        });
      } catch (err) {
        log.warn(
          `failed to set board status for issue: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } catch (err) {
      log.warn(
        `failed to add issue to project board: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    return issueUrl;
  } catch {
    return null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BOARD_STATUS,
  createIssueForJob,
  detectRepo,
  discoverFieldConfig,
  findProjectItem,
  getProjectNodeId,
  runGh,
  runGhJson,
  setProjectItemStatus
});
