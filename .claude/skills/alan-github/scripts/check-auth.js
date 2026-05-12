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

// src/skills/alan-github/check-auth.ts
var check_auth_exports = {};
__export(check_auth_exports, {
  checkAuth: () => checkAuth
});
module.exports = __toCommonJS(check_auth_exports);

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

// src/skills/alan-github/check-auth.ts
function checkAuth() {
  const warnings = [];
  if (process.env.GH_TOKEN) {
    warnings.push(
      "GH_TOKEN is set in the environment \u2014 this overrides keyring auth and likely lacks project scope."
    );
  }
  if (process.env.GITHUB_TOKEN) {
    warnings.push(
      "GITHUB_TOKEN is set in the environment \u2014 this overrides keyring auth and likely lacks project scope."
    );
  }
  try {
    const output = runGh(["auth", "status"]);
    const hasProjectScope = /Token scopes:.*\bproject\b/.test(output);
    if (hasProjectScope) {
      return {
        ok: true,
        message: "GitHub auth verified with project scope",
        warnings: warnings.length > 0 ? warnings : void 0
      };
    }
    return {
      ok: false,
      fix: "! GH_TOKEN= gh auth refresh -s project",
      message: "GitHub auth is missing the project scope.",
      warnings: warnings.length > 0 ? warnings : void 0
    };
  } catch (err) {
    return {
      ok: false,
      message: `GitHub auth check failed: ${err instanceof Error ? err.message : String(err)}`,
      warnings: warnings.length > 0 ? warnings : void 0
    };
  }
}
if (require.main === module) {
  const result = checkAuth();
  process.stdout.write(JSON.stringify(result) + "\n");
  process.exit(result.ok ? 0 : 1);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkAuth
});
