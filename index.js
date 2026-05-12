import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const _thisFile = fileURLToPath(import.meta.url);

function getCallerPath() {
  const frames = new Error().stack.split('\n');
  for (const frame of frames.slice(1)) {
    const match = frame.match(/\(?(file:\/\/[^\s:)]+)/);
    if (match) {
      try {
        const filePath = fileURLToPath(match[1]);
        if (filePath !== _thisFile) {
          return filePath;
        }
      } catch {}
    }
  }
  return null;
}

export function file(filePath, options = {}) {
  const absolutePath = resolve(filePath, getCallerPath());
  return fs.readFileSync(absolutePath, {
    encoding: "utf-8",
    ...options,
  });
}

export default file;

// Three cases:
// 1. absolute path (starts with /) => use as is
// 2. relative path (starts with ./ or ../) => use path.resolve()
// 3. module path: use require.resolve()
export function resolve(pathString, callerPath) {
  if (callerPath === undefined) {
    callerPath = getCallerPath();
  }

  const { dir } = path.parse(pathString);
  const isAbsolute = path.isAbsolute(pathString);
  const isRelative = !isAbsolute && String(dir).startsWith(".");
  const isModule = !isAbsolute && !isRelative;

  if (isAbsolute) {
    return pathString;
  } else if (isRelative) {
    const callerDir = path.dirname(callerPath);
    return path.resolve(callerDir, pathString);
  } else if (isModule) {
    return createRequire(callerPath).resolve(pathString);
  } else {
    const msg = `Can't resolve absolute path: ${pathString}`;
    throw new Error(msg);
  }
}
