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

// src/skills/alan-github/create-milestone.ts
var create_milestone_exports = {};
__export(create_milestone_exports, {
  main: () => main
});
module.exports = __toCommonJS(create_milestone_exports);

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

// src/skills/alan-github/create-milestone.ts
function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!flag || !value) continue;
    if (flag === "--title") {
      args.title = value;
      i++;
    } else if (flag === "--repo") {
      args.repo = value;
      i++;
    } else if (flag === "--description") {
      args.description = value;
      i++;
    }
  }
  if (!args.title || !args.repo) {
    console.error("Usage: create-milestone --title <t> --repo <owner/repo> [--description <d>]");
    process.exit(1);
  }
  return args;
}
var REPO_FORMAT = /^(?!.*\.\.)[\w][\w.-]*\/[\w][\w.-]*$/;
function sanitizeField(s) {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\n\r]/g, "");
}
function main() {
  const args = parseArgs();
  if (!REPO_FORMAT.test(args.repo)) {
    console.error("Invalid repo format, expected owner/repo");
    process.exit(1);
  }
  const title = sanitizeField(args.title);
  const apiArgs = ["api", `repos/${args.repo}/milestones`, "-X", "POST", "-f", `title=${title}`];
  if (args.description) {
    apiArgs.push("-f", `description=${sanitizeField(args.description)}`);
  }
  let result;
  try {
    result = runGhJson(apiArgs);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stdout.write(JSON.stringify({ error: msg }) + "\n");
    process.exit(1);
  }
  process.stdout.write(
    JSON.stringify({
      number: result.number,
      url: result.html_url,
      title: result.title
    }) + "\n"
  );
}
if (require.main === module) {
  main();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
