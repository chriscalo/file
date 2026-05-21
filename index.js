import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);
const _caller = _require("caller");

function toFilePath(callerUrl) {
  try {
    return fileURLToPath(callerUrl);
  } catch {
    return callerUrl;
  }
}

export function file(filePath, options = {}) {
  const callerPath = toFilePath(_caller());
  const absolutePath = resolve(filePath, callerPath);
  return readFileSync(absolutePath, {
    encoding: "utf-8",
    ...options,
  });
}

export default file;

export function resolve(pathString, callerPath) {
  if (callerPath === undefined) {
    callerPath = toFilePath(_caller());
  }

  if (isAbsolute(pathString)) {
    return pathString;
  }

  const isRelative = pathString.startsWith("./") || pathString.startsWith("../");

  if (isRelative) {
    return pathResolve(dirname(callerPath), pathString);
  } else {
    return createRequire(callerPath).resolve(pathString);
  }
}

export function path(strings, ...values) {
  const maxLength = Math.max(strings.length, values.length);
  const parts = [];
  let i = 0;
  while (i < maxLength) {
    if (i < strings.length) parts.push(strings[i]);
    if (i < values.length) parts.push(values[i]);
    i++;
  }
  return join(...parts);
}
