# @chriscalo/file

No-fuss utility for getting the contents of a file.

Installation:

``` sh
npm install @chriscalo/file
# or
yarn add @chriscalo/file
```

Works for relative paths, absolute paths, and module paths (`node_modules` folder).

Usage:

``` js
const { file } = require("@chriscalo/file");

const contents1 = file("./relative/path/to/file.txt");
const contents2 = file("/absolute/path/to/file.txt");
const contents3 = file("module/path/to/file.txt");
const contents4 = file("./path/to/file.txt", {
  // override options passed to fs.readFileSync()
  encoding: "base64", // defaults to "utf-8"
});
```
