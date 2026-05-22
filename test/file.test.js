import { describe, test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fileDefault, { file, resolve } from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("exports file as a function", () => {
  const expected = "function";
  const actual = typeof file;
  assert.strictEqual(actual, expected);
});

test("exports file as the default export", () => {
  const expected = file;
  const actual = fileDefault;
  assert.strictEqual(actual, expected);
});

test("exports resolve as a function", () => {
  const expected = "function";
  const actual = typeof resolve;
  assert.strictEqual(actual, expected);
});


describe("resolve()", () => {
  test("has correct name", () => {
    const expected = "resolve";
    const actual = resolve.name;
    assert.strictEqual(actual, expected);
  });

  test("returns a string", () => {
    const result = resolve("/some/path.txt", __filename);
    const expected = "string";
    const actual = typeof result;
    assert.strictEqual(actual, expected);
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
    const actual = resolve("caller", __filename);
    assert.ok(path.isAbsolute(actual));
  });

  test("resolves npm package entry point to node_modules path", () => {
    const actual = resolve("caller", __filename);
    assert.ok(actual.includes("node_modules/caller"));
  });

  test("resolves npm package sub-path to absolute path", () => {
    const actual = resolve("caller/package.json", __filename);
    assert.ok(path.isAbsolute(actual));
  });

  test("resolves npm package sub-path to correct file", () => {
    const actual = resolve("caller/package.json", __filename);
    assert.ok(actual.endsWith("/caller/package.json"));
  });

  test("uses caller's directory when callerPath is omitted", () => {
    const expected = path.join(__dirname, "test.md");
    const actual = resolve("./test.md");
    assert.strictEqual(actual, expected);
  });
});


describe("file()", () => {
  test("has correct name", () => {
    const expected = "file";
    const actual = file.name;
    assert.strictEqual(actual, expected);
  });

  test("returns a string", () => {
    const result = file("./test.md");
    const expected = "string";
    const actual = typeof result;
    assert.strictEqual(actual, expected);
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

  test("returns a string for npm package path", () => {
    const result = file("caller/package.json");
    const expected = "string";
    const actual = typeof result;
    assert.strictEqual(actual, expected);
  });

  test("reads correct file from npm package path", () => {
    const content = file("caller/package.json");
    const pkg = JSON.parse(content);
    const expected = "caller";
    const actual = pkg.name;
    assert.strictEqual(actual, expected);
  });

  test("throws ENOENT for a non-existent file", () => {
    assert.throws(() => file("./does-not-exist-xyz.txt"), {
      code: "ENOENT",
    });
  });
});
