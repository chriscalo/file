import { describe, test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fileDefault, { file, resolve } from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("exports file as a function", () => {
  assert.strictEqual(typeof file, "function");
});

test("exports file as the default export", () => {
  assert.strictEqual(fileDefault, file);
});

test("exports resolve as a function", () => {
  assert.strictEqual(typeof resolve, "function");
});


describe("resolve()", () => {
  test("has correct name", () => {
    assert.strictEqual(resolve.name, "resolve");
  });

  test("returns a string", () => {
    const actual = resolve("/some/path.txt", __filename);
    assert.strictEqual(typeof actual, "string");
  });

  test("returns absolute path unchanged", () => {
    const expected = "/some/absolute/path.txt";
    const actual = resolve(expected, __filename);
    assert.strictEqual(actual, expected);
  });

  test("resolves ./ path against callerPath directory", () => {
    const expected = path.join(__dirname, "test.md");
    const actual = resolve("./test.md", __filename);
    assert.strictEqual(actual, expected);
  });

  test("resolves ../ path against callerPath directory", () => {
    const expected = path.join(__dirname, "..", "index.js");
    const actual = resolve("../index.js", __filename);
    assert.strictEqual(actual, expected);
  });

  test("resolves nested relative path against callerPath directory", () => {
    const expected = path.join(__dirname, "subdir", "foo.txt");
    const actual = resolve("./subdir/foo.txt", __filename);
    assert.strictEqual(actual, expected);
  });

  test("resolves built-in module specifier", () => {
    const expected = "path";
    const actual = resolve("path", __filename);
    assert.strictEqual(actual, expected);
  });

  test("resolves npm package entry point to absolute path", () => {
    const result = resolve("caller", __filename);
    assert.ok(path.isAbsolute(result), `expected absolute path, got: ${result}`);
    assert.ok(result.includes("node_modules/caller"), `expected path inside node_modules/caller, got: ${result}`);
  });

  test("resolves npm package sub-path to absolute path", () => {
    const result = resolve("caller/package.json", __filename);
    assert.ok(path.isAbsolute(result), `expected absolute path, got: ${result}`);
    assert.ok(result.endsWith("/caller/package.json"), `expected path ending with /caller/package.json, got: ${result}`);
  });

  test("resolves relative path against calling file when callerPath is omitted", () => {
    const expected = path.join(__dirname, "test.md");
    const actual = resolve("./test.md");
    assert.strictEqual(actual, expected);
  });
});


describe("file()", () => {
  test("has correct name", () => {
    assert.strictEqual(file.name, "file");
  });

  test("returns a string", () => {
    const actual = file("./test.md");
    assert.strictEqual(typeof actual, "string");
  });

  test("returns the file content", () => {
    const expected = "# This is a Markdown file\n\nYay\n";
    const actual = file("./test.md");
    assert.strictEqual(actual, expected);
  });

  test("accepts an absolute path", () => {
    const absPath = path.join(__dirname, "test.md");
    const expected = "# This is a Markdown file\n\nYay\n";
    const actual = file(absPath);
    assert.strictEqual(actual, expected);
  });

  test("returns a Buffer when encoding is null", () => {
    const actual = file("./test.md", { encoding: null });
    assert.ok(Buffer.isBuffer(actual));
  });

  test("reads file from npm package path", () => {
    const content = file("caller/package.json");
    assert.strictEqual(typeof content, "string");
    const pkg = JSON.parse(content);
    assert.strictEqual(pkg.name, "caller");
  });

  test("throws ENOENT for a non-existent file", () => {
    assert.throws(() => file("./does-not-exist-xyz.txt"), {
      code: "ENOENT",
    });
  });
});


