import { cli, Path } from "esmakefile";
import { PkgConfig } from "espkg-config";
import { writeFile, readFile } from "node:fs/promises";

import { njxRender } from "./jslib/njxRender.mjs";
import { Clang } from "./jslib/clang.mjs";
import Ajv from "ajv";

const ajv = new Ajv();
const stringArray = { type: "array", items: { type: "string" } };
const schema = {
  type: "object",
  properties: {
    cc: { type: "string" },
    cxx: { type: "string" },
    cppflags: { ...stringArray },
    cflags: { ...stringArray },
    cxxflags: { ...stringArray },
    ldflags: { ...stringArray },
    pkgConfigPaths: { ...stringArray, uniqueItems: true },
    libraryType: { type: "string", enum: ["static", "shared"] },
  },
  additionalProperties: false,
};

const validate = ajv.compile(schema);

const inputConfig = JSON.parse(await readFile("config.json", "utf8"));
if (!validate(inputConfig)) {
  console.error('The configuration file "config.json" has errors.');
  console.error(validate.errors);
  process.exit(1);
}

const config = {
  cc: "clang",
  cxx: "clang++",
  cppflags: [],
  cflags: ["-std=c17"],
  cxxflags: ["-std=c++20"],
  ldflags: [],
  pkgConfigPaths: ["pkgconfig"],
  libraryType: "static",
  ...inputConfig, // override the defaults
};

const pkg = new PkgConfig({
  searchPaths: config.pkgConfigPaths,
});

const { flags: gtestCflags } = await pkg.cflags(["gtest_main"]);
const { flags: gtestLibs } = await pkg.staticLibs(["gtest_main"]);

cli((make) => {
  const src = Path.src("src/unixsocket.c");
  const include = Path.src("include");
  const doxyfileTemplate = Path.src("Doxyfile.njk");
  const doxyfile = Path.build("Doxyfile");
  const html = Path.build("html/index.html");

  config.cppflags.unshift("-I", make.abs(include));
  const clang = new Clang(make, config);

  make.add("all", []);

  const obj = clang.compile(src);
  const lib = clang.link({
    name: "unixsocket",
    runtime: "c",
    linkType: config.libraryType,
    binaries: [obj],
  });

  const testSrc = Path.src("test/test.cpp");
  const testObj = clang.compile(testSrc, { extraFlags: gtestCflags });
  const test = clang.link({
    name: "unixsocket_test",
    runtime: "c++",
    linkType: "executable",
    binaries: [testObj, lib],
    extraFlags: [...gtestLibs],
  });

  make.add(doxyfile, [doxyfileTemplate], async (args) => {
    const res = await njxRender(args.abs(doxyfileTemplate), {
      outputDir: make.buildRoot,
      includeDir: args.abs(include),
    });
    await writeFile(args.abs(doxyfile), res, "utf8");
  });

  make.add(html, [doxyfile, Path.src("include/unixsocket.h")], async (args) => {
    return args.spawn("doxygen", [args.abs(doxyfile)]);
  });

  make.add("all", [lib, clang.compileCommands(), html, test]);
});
