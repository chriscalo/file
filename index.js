import { readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);
const _caller = _require("caller");

/**
 * Converts a file:// URL to a filesystem path,
 * passing through plain paths unchanged.
 * @param {string} callerUrl - A file:// URL or filesystem path
 * @returns {string} Filesystem path
 */
function toFilePath(callerUrl) {
  try {
    return fileURLToPath(callerUrl);
  } catch {
    return callerUrl;
  }
}

/**
 * Reads a file and returns its contents, resolving the path
 * relative to the calling module.
 *
 * @param {string} filePath - Absolute path, relative path
 *   (`./` or `../`), or module path
 * @param {{ encoding?: BufferEncoding | null, flag?: string }}
 *   [options] - Options passed to `fs.readFileSync`; defaults
 *   to UTF-8 encoding
 * @returns {string | Buffer} File contents as a UTF-8 string
 *   by default, or a Buffer if `encoding: null` is passed
 */
export function file(filePath, options = {}) {
  const callerPath = toFilePath(_caller());
  const absolutePath = resolve(filePath, callerPath);
  return readFileSync(absolutePath, {
    encoding: "utf-8",
    ...options,
  });
}

export default file;

/**
 * Resolves a file path to an absolute path, relative to the
 * calling module.
 *
 * @param {string} pathString - Absolute path, relative path
 *   (`./` or `../`), or module path (resolved via
 *   `require.resolve`)
 * @param {string} [callerPath] - Override the caller's
 *   filesystem path; defaults to the auto-detected caller
 * @returns {string} Absolute filesystem path
 */
export function resolve(pathString, callerPath) {
  // Three cases:
  // 1. absolute path (starts with /) => use as is
  // 2. relative path (starts with ./ or ../) => use path.resolve()
  // 3. module path => use require.resolve() for node_modules lookup
  if (callerPath === undefined) {
    callerPath = toFilePath(_caller());
  }

  if (isAbsolute(pathString)) {
    return pathString;
  }

  const isRelative =
    pathString.startsWith("./") || pathString.startsWith("../");

  if (isRelative) {
    return pathResolve(dirname(callerPath), pathString);
  } else {
    return createRequire(callerPath).resolve(pathString);
  }
}
