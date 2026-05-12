"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/skills/alan-memory-search/search.ts
var import_net = __toESM(require("net"));
var import_os = __toESM(require("os"));
var import_path = __toESM(require("path"));
var TIMEOUT_MS = 5e3;
var alanHome = process.env.ALAN_HOME ?? import_path.default.join(import_os.default.homedir(), ".claude", "alan");
var socketPath = import_path.default.join(alanHome, "search.sock");
var rawQuery = process.argv[2] ?? "";
var maxResults = process.argv[3] ? parseInt(process.argv[3], 10) : 5;
function main() {
  const socket = import_net.default.connect(socketPath);
  let buffer = "";
  let done = false;
  const finish = (output) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    process.stdout.write(output + "\n");
    socket.destroy();
  };
  const timer = setTimeout(() => {
    finish("[]");
  }, TIMEOUT_MS);
  socket.once("error", () => {
    finish("[]");
  });
  socket.once("connect", () => {
    const request = JSON.stringify({
      jsonrpc: "2.0",
      method: "search",
      params: { query: rawQuery, maxResults },
      id: 1
    }) + "\n";
    socket.write(request);
  });
  socket.on("data", (data) => {
    buffer += data.toString();
    const newlineIdx = buffer.indexOf("\n");
    if (newlineIdx === -1) return;
    const line = buffer.slice(0, newlineIdx);
    try {
      const response = JSON.parse(line);
      finish(JSON.stringify(response.result ?? []));
    } catch {
      finish("[]");
    }
  });
}
main();
