import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import caller from "caller";

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
function file(filePath, options = {}) {
  const callerUrl = toCallerUrl(caller());
  const resolved = resolveUrl(filePath, callerUrl);
  return readFileSync(resolved, { encoding: "utf-8", ...options });
}

export { file };
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
 * @returns {string} Absolute filesystem path, or bare module
 *   name for Node.js built-ins (e.g. `"path"`, `"fs"`)
 */
export function resolve(pathString, callerPath) {
  const ref = callerPath !== undefined ? callerPath : caller();
  const callerUrl = toCallerUrl(ref);
  const url = resolveUrl(pathString, callerUrl);
  return url.protocol === "node:" ? url.pathname : fileURLToPath(url);
}

/**
 * Converts a file:// URL string or filesystem path to a URL object.
 * @param {string} path - A file:// URL string or filesystem path
 * @returns {URL}
 */
function toCallerUrl(path) {
  return path.startsWith("file://") ? new URL(path) : pathToFileURL(path);
}

/**
 * Resolves a file path against a caller URL, always returning a URL.
 * Node.js built-in modules are returned as `node:<name>` URLs.
 * @param {string} filePath - Absolute path, relative path, or module path
 * @param {URL} callerUrl - file:// URL of the calling module
 * @returns {URL}
 */
function resolveUrl(filePath, callerUrl) {
  const isAbsolute = filePath.startsWith("/");
  const isRelative = !isAbsolute && (
    filePath.startsWith("./") || filePath.startsWith("../")
  );
  const isModule = !isAbsolute && !isRelative;

  // Three cases:
  // 1. absolute path (starts with /) => convert to file:// URL
  // 2. relative path (starts with ./ or ../) => resolve against caller URL
  // 3. module path => use require.resolve() for node_modules lookup
  if (isAbsolute) {
    return pathToFileURL(filePath);
  } else if (isRelative) {
    return new URL(filePath, callerUrl);
  } else if (isModule) {
    const resolved = createRequire(callerUrl).resolve(filePath);
    // built-in modules resolve to their bare name (e.g. "path"), not a file path
    return resolved.startsWith("/") ? pathToFileURL(resolved) : new URL(`node:${resolved}`);
  }
}
