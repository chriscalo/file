import test from "ava";

import { file, resolve } from "../index.js";

test("reads files", t => {
  const markdownFile = file("./test.md");
  t.is(typeof markdownFile, "string");
  t.truthy(markdownFile.length > 0);
});
