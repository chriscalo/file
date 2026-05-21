import { describe, test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { file, resolve, path as pathTag, glob } from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("exports resolve as a function", () => {
  assert.strictEqual(typeof resolve, "function");
});

test("exports file as a function", () => {
  assert.strictEqual(typeof file, "function");
});

test("exports path as a function", () => {
  assert.strictEqual(typeof pathTag, "function");
});

test("exports glob as a function", () => {
  assert.strictEqual(typeof glob, "function");
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

  test("resolves relative path against calling file when callerPath is omitted", () => {
    const expected = path.join(__dirname, "test.md");
    const actual = resolve("./test.md");
    assert.strictEqual(actual, expected);
  });
});

describe("path()", () => {
  test("has correct name", () => {
    assert.strictEqual(pathTag.name, "path");
  });

  test("joins path segments from template literal", () => {
    const dir = "foo";
    const file = "bar.txt";
    const actual = pathTag`${dir}/${file}`;
    assert.strictEqual(actual, "foo/bar.txt");
  });

  test("works with static path strings", () => {
    const actual = pathTag`foo/bar/baz.txt`;
    assert.strictEqual(actual, "foo/bar/baz.txt");
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

  test("throws ENOENT for a non-existent file", () => {
    assert.throws(() => file("./does-not-exist-xyz.txt"), {
      code: "ENOENT",
    });
  });
});

describe("glob()", () => {
  test("has correct name", () => {
    assert.strictEqual(glob.name, "glob");
  });

  test("returns an array", () => {
    const result = glob("**/*.md");
    assert.ok(Array.isArray(result));
  });

  test("matches files by pattern", () => {
    const result = glob("test/*.md");
    assert.ok(result.some((p) => p.endsWith("test.md")));
  });

  test("accepts multiple patterns", () => {
    const result = glob("test/*.md", "*.json");
    assert.ok(result.some((p) => p.endsWith(".md")));
    assert.ok(result.some((p) => p.endsWith(".json")));
  });

  test("supports exclusion patterns", () => {
    const withAll = glob("test/*");
    const withExclusion = glob("test/*", "!test/*.md");
    assert.ok(withExclusion.length < withAll.length);
  });
});

