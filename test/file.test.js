import { test } from "node:test";
import assert from "node:assert/strict";

import { file } from "../index.js";

test("reads files", () => {
  const markdownFile = file("./test.md");
  assert.equal(typeof markdownFile, "string");
  assert.ok(markdownFile.length > 0);
});
