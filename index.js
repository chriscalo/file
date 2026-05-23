import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import caller from "caller";

function toCallerUrl(callerRef) {
  return callerRef.startsWith("file://") ? callerRef : pathToFileURL(callerRef).href;
}

export function file(filePath, options = {}) {
  const callerUrl = toCallerUrl(caller());
  const resolved = _resolveUrl(filePath, callerUrl);
  return readFileSync(resolved, { encoding: "utf-8", ...options });
}

export default file;

export function resolve(pathString, callerPath) {
  const callerUrl = toCallerUrl(callerPath !== undefined ? callerPath : caller());
  const resolved = _resolveUrl(pathString, callerUrl);
  return resolved instanceof URL ? fileURLToPath(resolved) : resolved;
}

function _resolveUrl(filePath, callerUrl) {
  if (filePath.startsWith("/")) return filePath;
  const isRelative = filePath.startsWith("./") || filePath.startsWith("../");
  return isRelative
    ? new URL(filePath, callerUrl)
    : createRequire(callerUrl).resolve(filePath);
}
