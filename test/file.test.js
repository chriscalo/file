import { test } from "node:test";
import assert from "node:assert/strict";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { file, resolve } from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// resolve() tests

test("resolve() returns absolute path unchanged", () => {
  const absPath = "/some/absolute/path.txt";
  assert.equal(resolve(absPath, __filename), absPath);
});

test("resolve() resolves ./ relative path against callerPath", () => {
  const result = resolve("./test.md", __filename);
  assert.equal(result, path.join(__dirname, "test.md"));
});

test("resolve() resolves ../ relative path against callerPath", () => {
  const result = resolve("../index.js", __filename);
  assert.equal(result, path.join(__dirname, "..", "index.js"));
});

test("resolve() resolves nested relative path against callerPath", () => {
  const result = resolve("./subdir/foo.txt", __filename);
  assert.equal(result, path.join(__dirname, "subdir", "foo.txt"));
});

test("resolve() resolves module path via require.resolve", () => {
  const result = resolve("path", __filename);
  assert.equal(typeof result, "string");
  assert.ok(result.length > 0);
});

test("resolve() resolves 'fs' module path", () => {
  const result = resolve("fs", __filename);
  assert.equal(typeof result, "string");
  assert.ok(result.length > 0);
});

test("resolve() infers callerPath from stack when not provided", () => {
  const result = resolve("./test.md");
  assert.equal(result, path.join(__dirname, "test.md"));
});

// file() tests

test("file() reads file as a string", () => {
  const content = file("./test.md");
  assert.equal(typeof content, "string");
  assert.ok(content.length > 0);
});

test("file() content matches fs.readFileSync output", () => {
  const content = file("./test.md");
  const expected = fs.readFileSync(path.join(__dirname, "test.md"), "utf-8");
  assert.equal(content, expected);
});

test("file() reads file using an absolute path", () => {
  const absPath = path.join(__dirname, "test.md");
  const content = file(absPath);
  const expected = fs.readFileSync(absPath, "utf-8");
  assert.equal(content, expected);
});

test("file() accepts encoding option", () => {
  const content = file("./test.md", { encoding: "utf-8" });
  assert.equal(typeof content, "string");
  assert.ok(content.length > 0);
});

test("file() returns a Buffer when encoding is null", () => {
  const content = file("./test.md", { encoding: null });
  assert.ok(Buffer.isBuffer(content));
});

test("file() throws for a non-existent file", () => {
  assert.throws(() => file("./does-not-exist-xyz.txt"), {
    code: "ENOENT",
  });
});
