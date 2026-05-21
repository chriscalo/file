import { existsSync, readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve as pathResolve } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import fastGlob from "fast-glob";
import { temporaryDirectory } from "tempy";

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

export function glob(...patterns) {
  return fastGlob.sync(patterns);
}

export async function usingTempDir(useFn) {
  const tempDir = temporaryDirectory();
  try {
    return await useFn(tempDir);
  } finally {
    await rm(tempDir, { recursive: true });
  }
}

export async function waitUntilFileExists(filePath, timeout = 30_000) {
  const startTime = performance.now();
  while (!existsSync(filePath)) {
    if (performance.now() - startTime >= timeout) {
      throw new Error("Timeout exceeded");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
