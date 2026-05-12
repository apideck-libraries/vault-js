"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lint/run-check-resolvable.ts
var run_check_resolvable_exports = {};
__export(run_check_resolvable_exports, {
  main: () => main
});
module.exports = __toCommonJS(run_check_resolvable_exports);
var import_node_fs4 = __toESM(require("node:fs"));
var import_node_os = __toESM(require("node:os"));
var import_node_path4 = __toESM(require("node:path"));

// src/jobs/generate-manifest.ts
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));

// src/jobs/parse-frontmatter.ts
var stripQuotes = (value) => value.trim().replace(/^['"]|['"]$/g, "");
var parseFrontmatter = (content) => {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match || match[1] === void 0) return {};
  const block = match[1];
  const result = {};
  const lines = block.split("\n");
  let currentKey = null;
  let currentList = null;
  let multilineKey = null;
  let multilineLines = [];
  const flushMultiline = () => {
    if (multilineKey !== null) {
      result[multilineKey] = multilineLines.join(" ").trim();
      multilineKey = null;
      multilineLines = [];
    }
  };
  const flushList = () => {
    if (currentKey !== null && currentList !== null) {
      result[currentKey] = currentList;
      currentKey = null;
      currentList = null;
    }
  };
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (currentList !== null && /^\s+-\s+/.test(line)) {
      currentList.push(stripQuotes(line.replace(/^\s+-\s+/, "")));
      continue;
    }
    if (multilineKey !== null && /^\s+\S/.test(line) && !/^\s+-\s+/.test(line)) {
      multilineLines.push(line.trim());
      continue;
    }
    flushList();
    flushMultiline();
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1];
    const rest = kv[2];
    if (key === void 0 || rest === void 0) continue;
    if (rest === "") {
      currentKey = key;
      currentList = [];
      continue;
    }
    if (rest === ">-" || rest === ">" || rest === "|" || rest === "|-") {
      multilineKey = key;
      multilineLines = [];
      continue;
    }
    if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1).trim();
      const items = inner.length ? inner.split(",").map((s) => stripQuotes(s)) : [];
      result[key] = items;
      continue;
    }
    result[key] = stripQuotes(rest);
  }
  if (currentKey !== null && currentList !== null && currentList.length > 0) {
    result[currentKey] = currentList;
    currentKey = null;
    currentList = null;
    multilineKey = null;
    multilineLines = [];
  } else {
    flushMultiline();
    if (currentKey !== null) {
      result[currentKey] = "";
      currentKey = null;
      currentList = null;
    }
  }
  return result;
};

// src/jobs/generate-manifest.ts
var extractStringField = (frontmatter, key) => {
  const value = frontmatter[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
var buildEntry = (filePath, relativePath, category) => {
  const content = import_node_fs.default.readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(content);
  const name = extractStringField(frontmatter, "name");
  const description = extractStringField(frontmatter, "description");
  const section = extractStringField(frontmatter, "section");
  const triggersValue = frontmatter["triggers"];
  const triggers = Array.isArray(triggersValue) && triggersValue.length > 0 ? triggersValue : null;
  if (name === null || description === null || section === null || triggers === null) return null;
  return { name, path: relativePath, description, category, section, triggers };
};
var listMarkdown = (dir) => {
  if (!import_node_fs.default.existsSync(dir)) return [];
  return import_node_fs.default.readdirSync(dir).filter((f) => f.endsWith(".md"));
};
var listSubdirs = (dir) => {
  if (!import_node_fs.default.existsSync(dir)) return [];
  return import_node_fs.default.readdirSync(dir).filter((name) => {
    const full = import_node_path.default.join(dir, name);
    return import_node_fs.default.statSync(full).isDirectory();
  });
};
var generateManifest = (opts) => {
  const { sourcePath, outputPath } = opts;
  const entries = [];
  const agentsDir = import_node_path.default.join(sourcePath, "agents");
  for (const file of listMarkdown(agentsDir)) {
    const entry = buildEntry(import_node_path.default.join(agentsDir, file), `agents/${file}`, "agent");
    if (entry !== null) entries.push(entry);
  }
  const commandsDir = import_node_path.default.join(sourcePath, "commands");
  for (const file of listMarkdown(commandsDir)) {
    const entry = buildEntry(import_node_path.default.join(commandsDir, file), `commands/${file}`, "command");
    if (entry !== null) entries.push(entry);
  }
  const skillsDir = import_node_path.default.join(sourcePath, "skills");
  for (const dirName of listSubdirs(skillsDir)) {
    const skillMdPath = import_node_path.default.join(skillsDir, dirName, "SKILL.md");
    if (!import_node_fs.default.existsSync(skillMdPath)) continue;
    const entry = buildEntry(skillMdPath, `skills/${dirName}/SKILL.md`, "skill");
    if (entry !== null) entries.push(entry);
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  import_node_fs.default.mkdirSync(import_node_path.default.dirname(outputPath), { recursive: true });
  import_node_fs.default.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
  return entries;
};

// src/jobs/generate-resolver.ts
var import_node_fs2 = __toESM(require("node:fs"));
var import_node_path2 = __toESM(require("node:path"));
var SECTION_ORDER = [
  "Codebase",
  "Research",
  "Planning",
  "Pipeline",
  "Operations",
  "Memory",
  "Skills",
  "Meta"
];
var escapePipe = (s) => s.replace(/\|/g, "\\|");
var buildSectionTable = (entries) => {
  const rows = entries.slice().sort((a, b) => a.name.localeCompare(b.name)).map((entry) => {
    const trigCol = entry.triggers.map((t) => `"${escapePipe(t)}"`).join(" / ");
    return `| ${trigCol} | \`${escapePipe(entry.path)}\` |`;
  }).join("\n");
  return `| Trigger | Capability |
|---------|------------|
${rows}`;
};
var generateResolver = (opts) => {
  const { manifest, framePath, outputPath } = opts;
  const frame = import_node_fs2.default.readFileSync(framePath, "utf8");
  const validSections = new Set(SECTION_ORDER);
  for (const entry of manifest) {
    if (!validSections.has(entry.section)) {
      throw new Error(
        `Unknown section '${entry.section}' for '${entry.path}'. Valid sections: ${SECTION_ORDER.join(", ")}`
      );
    }
  }
  const grouped = /* @__PURE__ */ new Map();
  for (const entry of manifest) {
    const existing = grouped.get(entry.section);
    if (existing) {
      existing.push(entry);
    } else {
      grouped.set(entry.section, [entry]);
    }
  }
  const sectionBlocks = [];
  for (const sectionName of SECTION_ORDER) {
    const entries = grouped.get(sectionName);
    if (!entries || entries.length === 0) continue;
    const table = buildSectionTable(entries);
    sectionBlocks.push(`## ${sectionName}

${table}`);
  }
  const sectionsContent = sectionBlocks.join("\n\n");
  const sentinelRegex = /<!-- alan:routes -->[\s\S]*?<!-- \/alan:routes -->/;
  if (!sentinelRegex.test(frame)) {
    throw new Error(
      `RESOLVER.md frame at ${framePath} is missing <!-- alan:routes --> ... <!-- /alan:routes --> sentinel block`
    );
  }
  const replacement = `<!-- alan:routes -->

${sectionsContent}

<!-- /alan:routes -->`;
  const result = frame.replace(sentinelRegex, replacement);
  import_node_fs2.default.mkdirSync(import_node_path2.default.dirname(outputPath), { recursive: true });
  import_node_fs2.default.writeFileSync(outputPath, result);
  return result;
};

// src/lint/check-resolvable.ts
var import_node_fs3 = __toESM(require("node:fs"));
var import_node_path3 = __toESM(require("node:path"));
var resolveCapabilityPath = (capabilityPath, opts) => {
  if (opts.mode === "source") {
    return import_node_path3.default.join(opts.sourceRoot, capabilityPath);
  }
  if (capabilityPath.startsWith("agents/")) {
    return import_node_path3.default.join(opts.projectPath, ".claude", "agents", import_node_path3.default.basename(capabilityPath));
  }
  if (capabilityPath.startsWith("skills/")) {
    const dirName = capabilityPath.split("/")[1];
    if (!dirName || dirName === "SKILL.md") {
      return import_node_path3.default.join(opts.projectPath, capabilityPath);
    }
    return import_node_path3.default.join(opts.projectPath, ".claude", "skills", dirName, "SKILL.md");
  }
  if (capabilityPath.startsWith("commands/")) {
    const fileName = import_node_path3.default.basename(capabilityPath).replace(/^alan-/, "");
    return import_node_path3.default.join(opts.claudeHome, "commands", "alan", fileName);
  }
  return import_node_path3.default.join(opts.projectPath, capabilityPath);
};
var CAPABILITY_PATH_RE = /`((?:agents|commands|skills)\/[^`]+\.md)`/;
var parseResolverEntries = (resolverContent) => {
  const entries = [];
  let currentSection = "";
  for (const rawLine of resolverContent.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const heading = /^##\s+(.+)/.exec(line);
    if (heading && heading[1] !== void 0) {
      currentSection = heading[1].trim();
      continue;
    }
    if (!line.startsWith("|") || line.includes("---")) continue;
    const cols = line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    if (cols.length < 2) continue;
    const trigger = cols[0] ?? "";
    const capabilityCol = cols[1] ?? "";
    const lowered = trigger.toLowerCase();
    if (lowered === "trigger" || lowered === "capability" || lowered === "skill") continue;
    const pathMatch = CAPABILITY_PATH_RE.exec(capabilityCol);
    if (pathMatch && pathMatch[1] !== void 0) {
      entries.push({
        trigger,
        capabilityPath: pathMatch[1],
        isExternal: false,
        section: currentSection
      });
      continue;
    }
    entries.push({
      trigger,
      capabilityPath: capabilityCol,
      isExternal: true,
      section: currentSection
    });
  }
  return entries;
};
var loadManifest = (manifestPath) => {
  if (!import_node_fs3.default.existsSync(manifestPath)) return [];
  try {
    const parsed = JSON.parse(import_node_fs3.default.readFileSync(manifestPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
var readResolver = (resolverPath) => {
  if (!import_node_fs3.default.existsSync(resolverPath)) return null;
  return import_node_fs3.default.readFileSync(resolverPath, "utf8");
};
var checkReachability = (manifest, entries) => {
  const resolverPaths = new Set(entries.filter((e) => !e.isExternal).map((e) => e.capabilityPath));
  const issues = [];
  let reachable = 0;
  let unreachable = 0;
  for (const entry of manifest) {
    if (resolverPaths.has(entry.path)) {
      reachable++;
      continue;
    }
    unreachable++;
    issues.push({
      type: "unreachable",
      severity: "error",
      capability: entry.name,
      message: `Capability '${entry.name}' (${entry.path}) has no trigger row in RESOLVER.md`,
      action: `Add a trigger row referencing '${entry.path}' in RESOLVER.md`
    });
  }
  return { reachable, unreachable, issues };
};
var checkFileExistence = (manifest, entries, opts) => {
  const manifestPaths = new Set(manifest.map((e) => e.path));
  const issues = [];
  for (const entry of entries) {
    if (entry.isExternal) continue;
    const fullPath = resolveCapabilityPath(entry.capabilityPath, opts);
    const exists = import_node_fs3.default.existsSync(fullPath);
    if (!exists) {
      issues.push({
        type: "missing_file",
        severity: "error",
        capability: entry.capabilityPath,
        message: `RESOLVER.md references '${entry.capabilityPath}' but the file does not exist`,
        action: `Create '${fullPath}' or remove the RESOLVER.md row`
      });
      continue;
    }
    if (!manifestPaths.has(entry.capabilityPath)) {
      issues.push({
        type: "orphan_trigger",
        severity: "warning",
        capability: entry.capabilityPath,
        message: `RESOLVER.md points to '${entry.capabilityPath}' which is not in _manifest.json`,
        action: `Ensure '${entry.capabilityPath}' has name+description frontmatter so it appears in the manifest, or remove from RESOLVER.md`
      });
    }
  }
  return issues;
};
var normalizeTrigger = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
var checkMeceOverlap = (manifest) => {
  const issues = [];
  const triggerPairs = [];
  for (const entry of manifest) {
    for (const trigger of entry.triggers) {
      const norm = normalizeTrigger(trigger);
      if (norm === "") continue;
      triggerPairs.push({ path: entry.path, norm, raw: trigger });
    }
  }
  const byNorm = /* @__PURE__ */ new Map();
  for (const { path: path5, norm } of triggerPairs) {
    const paths = byNorm.get(norm) ?? [];
    if (!paths.includes(path5)) paths.push(path5);
    byNorm.set(norm, paths);
  }
  for (const [norm, paths] of byNorm) {
    if (paths.length > 1) {
      issues.push({
        type: "mece_overlap",
        severity: "error",
        capability: paths.join(", "),
        message: `Multiple capabilities declare the same trigger "${norm}": ${paths.join(", ")}`,
        action: "Assign each trigger phrase to exactly one capability"
      });
    }
  }
  const seenPairs = /* @__PURE__ */ new Set();
  for (let i = 0; i < triggerPairs.length; i++) {
    for (let j = i + 1; j < triggerPairs.length; j++) {
      const a = triggerPairs[i];
      const b = triggerPairs[j];
      if (a.path === b.path) continue;
      if (a.norm === b.norm) continue;
      if (!a.norm.includes(b.norm) && !b.norm.includes(a.norm)) continue;
      const key = [a.path, b.path].sort().join("|") + "|" + [a.norm, b.norm].sort().join("||");
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      issues.push({
        type: "mece_overlap",
        severity: "warning",
        capability: [a.path, b.path].sort().join(", "),
        message: `Trigger phrases overlap by substring: "${a.norm}" (${a.path}) vs "${b.norm}" (${b.path})`,
        action: "Refine one trigger so it does not contain the other"
      });
    }
  }
  return issues;
};
var checkResolvable = (opts) => {
  const { manifestPath, resolverPath } = opts;
  const manifest = loadManifest(manifestPath);
  const resolverContent = readResolver(resolverPath);
  if (resolverContent === null) {
    return {
      ok: false,
      issues: [
        {
          type: "missing_file",
          severity: "error",
          capability: "RESOLVER.md",
          message: `RESOLVER.md not found at '${resolverPath}'`,
          action: `Create RESOLVER.md with routing tables for each capability`
        }
      ],
      summary: {
        total_capabilities: manifest.length,
        reachable: 0,
        unreachable: manifest.length,
        overlaps: 0,
        gaps: 0
      }
    };
  }
  const entries = parseResolverEntries(resolverContent);
  const {
    reachable,
    unreachable,
    issues: reachabilityIssues
  } = checkReachability(manifest, entries);
  const existenceIssues = checkFileExistence(manifest, entries, opts);
  const overlapIssues = checkMeceOverlap(manifest);
  const gapIssues = [];
  const issues = [...reachabilityIssues, ...existenceIssues, ...overlapIssues, ...gapIssues];
  const hasError = issues.some((i) => i.severity === "error");
  return {
    ok: !hasError,
    issues,
    summary: {
      total_capabilities: manifest.length,
      reachable,
      unreachable,
      overlaps: overlapIssues.length,
      gaps: gapIssues.length
    }
  };
};

// src/lint/run-check-resolvable.ts
var isUnderPrefix = (target, prefix) => {
  const t = import_node_path4.default.resolve(target);
  const p = import_node_path4.default.resolve(prefix);
  return t === p || t.startsWith(p + import_node_path4.default.sep);
};
var parseArgs = (argv) => {
  const args = argv.slice(2);
  const get = (flag) => {
    const idx = args.indexOf(flag);
    if (idx === -1) return null;
    return args[idx + 1] ?? null;
  };
  const modeRaw = get("--mode") ?? "source";
  const mode = modeRaw === "installed" ? "installed" : "source";
  const projectPathRaw = get("--project") ?? process.cwd();
  const claudeHomeRaw = get("--claude-home") ?? process.env.CLAUDE_CONFIG_DIR ?? import_node_path4.default.join(import_node_os.default.homedir(), ".claude");
  const projectPath = import_node_path4.default.resolve(projectPathRaw);
  const claudeHome = import_node_path4.default.resolve(claudeHomeRaw);
  let sourceRoot = "";
  if (mode === "source") {
    const findTemplates = () => {
      let dir = __dirname;
      for (let i = 0; i < 5; i++) {
        const candidate = import_node_path4.default.join(dir, "templates");
        if (import_node_fs4.default.existsSync(candidate)) return candidate;
        dir = import_node_path4.default.dirname(dir);
      }
      return import_node_path4.default.join(__dirname, "..", "templates");
    };
    const sourceRootRaw = get("--source-root") ?? get("--templates") ?? findTemplates();
    sourceRoot = import_node_path4.default.resolve(sourceRootRaw);
    if (!import_node_fs4.default.existsSync(sourceRoot)) {
      process.stderr.write(
        `run-check-resolvable: source root does not exist: ${sourceRoot}
Pass --source-root <path> pointing to a templates/ directory, or run in --mode installed.
`
      );
      process.exit(1);
    }
    const allowedPrefixes = [projectPath, claudeHome, import_node_os.default.homedir(), import_node_os.default.tmpdir()];
    if (!allowedPrefixes.some((p) => isUnderPrefix(sourceRoot, p))) {
      process.stderr.write(
        `run-check-resolvable: --source-root ${sourceRoot} must resolve under one of: ${allowedPrefixes.join(", ")}
`
      );
      process.exit(1);
    }
  }
  return {
    mode,
    sourceRoot,
    projectPath,
    claudeHome,
    manifestPath: get("--manifest"),
    resolverPath: get("--resolver")
  };
};
var formatIssue = (issue) => {
  return `  [${issue.severity}] ${issue.type} \u2014 ${issue.message}
    \u2192 ${issue.action}`;
};
var main = () => {
  const { mode, sourceRoot, projectPath, claudeHome, manifestPath, resolverPath } = parseArgs(
    process.argv
  );
  let tempManifestDir = null;
  let tempManifestPath = null;
  let manifestPathResolved;
  let resolverPathResolved;
  if (mode === "source") {
    if (manifestPath) {
      manifestPathResolved = manifestPath;
    } else {
      tempManifestDir = import_node_fs4.default.mkdtempSync(import_node_path4.default.join(import_node_os.default.tmpdir(), "_alan-manifest-check-"));
      tempManifestPath = import_node_path4.default.join(tempManifestDir, "manifest.json");
      generateManifest({ sourcePath: sourceRoot, outputPath: tempManifestPath });
      manifestPathResolved = tempManifestPath;
    }
    if (resolverPath) {
      resolverPathResolved = resolverPath;
    } else {
      if (!tempManifestDir) {
        tempManifestDir = import_node_fs4.default.mkdtempSync(import_node_path4.default.join(import_node_os.default.tmpdir(), "_alan-manifest-check-"));
      }
      const manifestEntries = JSON.parse(
        import_node_fs4.default.readFileSync(manifestPathResolved, "utf8")
      );
      const tempResolverPath = import_node_path4.default.join(tempManifestDir, "RESOLVER.md");
      generateResolver({
        manifest: manifestEntries,
        framePath: import_node_path4.default.join(sourceRoot, "RESOLVER.md.tmpl"),
        outputPath: tempResolverPath
      });
      resolverPathResolved = tempResolverPath;
    }
  } else {
    manifestPathResolved = manifestPath ?? import_node_path4.default.join(projectPath, ".alan", "_manifest.json");
    resolverPathResolved = resolverPath ?? import_node_path4.default.join(projectPath, ".alan", "RESOLVER.md");
  }
  try {
    const report = checkResolvable(
      mode === "source" ? {
        mode: "source",
        sourceRoot,
        manifestPath: manifestPathResolved,
        resolverPath: resolverPathResolved
      } : {
        mode: "installed",
        projectPath,
        claudeHome,
        manifestPath: manifestPathResolved,
        resolverPath: resolverPathResolved
      }
    );
    const errors = report.issues.filter((i) => i.severity === "error");
    const warnings = report.issues.filter((i) => i.severity === "warning");
    if (errors.length > 0) {
      process.stderr.write(`Resolver check: FAILED (${errors.length} error(s))
`);
      for (const issue of errors) {
        process.stderr.write(`${formatIssue(issue)}
`);
      }
      if (warnings.length > 0) {
        process.stderr.write(`
${warnings.length} warning(s):
`);
        for (const issue of warnings) {
          process.stderr.write(`${formatIssue(issue)}
`);
        }
      }
      return 1;
    }
    if (warnings.length > 0) {
      process.stderr.write(
        `Resolver check: OK with ${warnings.length} warning(s) (${report.summary.reachable}/${report.summary.total_capabilities} reachable)
`
      );
      for (const issue of warnings) {
        process.stderr.write(`${formatIssue(issue)}
`);
      }
      return 0;
    }
    process.stdout.write(
      `Resolver check: OK (${report.summary.total_capabilities} capabilities, all reachable)
`
    );
    return 0;
  } finally {
    if (tempManifestDir) {
      try {
        import_node_fs4.default.rmSync(tempManifestDir, { recursive: true, force: true });
      } catch {
      }
    }
  }
};
if (require.main === module) {
  process.exit(main());
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
