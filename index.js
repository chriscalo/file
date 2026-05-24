import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import caller from "caller";

/**
 * Converts a file:// URL or filesystem path to a file:// URL.
 * @param {string} path - A file:// URL or filesystem path
 * @returns {string} file:// URL
 */
function toCallerUrl(path) {
  return path.startsWith("file://") ? path : pathToFileURL(path).href;
}

/**
 * Resolves a file path against a caller URL.
 * @param {string} filePath - Absolute path, relative path, or module path
 * @param {string} callerUrl - file:// URL of the calling module
 * @returns {string | URL} Resolved path or URL
 */
function resolveUrl(filePath, callerUrl) {
  const isAbsolute = filePath.startsWith("/");
  const isRelative = !isAbsolute && (
    filePath.startsWith("./") || filePath.startsWith("../")
  );
  const isModule = !isAbsolute && !isRelative;

  // Three cases:
  // 1. absolute path (starts with /) => use as is
  // 2. relative path (starts with ./ or ../) => use URL resolution
  // 3. module path => use require.resolve() for node_modules lookup
  if (isAbsolute) {
    return filePath;
  } else if (isRelative) {
    return new URL(filePath, callerUrl);
  } else {
    return createRequire(callerUrl).resolve(filePath);
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
  const callerUrl = toCallerUrl(caller());
  const resolved = resolveUrl(filePath, callerUrl);
  return readFileSync(resolved, { encoding: "utf-8", ...options });
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
  const callerUrl = toCallerUrl(callerPath !== undefined ? callerPath : caller());
  const resolved = resolveUrl(pathString, callerUrl);
  return resolved instanceof URL ? fileURLToPath(resolved) : resolved;
}
