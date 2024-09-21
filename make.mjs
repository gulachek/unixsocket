import { cli, Path } from "esmakefile";
import { writeFile, readFile } from "node:fs/promises";

cli((make) => {
  const src = Path.src("src/unixsocket.c");
  const obj = Path.gen(src, { ext: ".o" });
  const include = Path.src("include");
  const compileCommands = Path.build("compile_commands.json");
  const lib = Path.build("libunixsocket.dylib");

  const cflags = ["-c", "-std=c17", "-I", make.abs(include)];

  make.add("all", [lib, compileCommands]);

  make.add(lib, obj, (args) => {
    return args.spawn("clang", [
      "-dynamiclib",
      "-o",
      args.abs(lib),
      args.abs(obj),
    ]);
  });

  make.add(obj, src, async (args) => {
    const [s, o] = args.absAll(src, obj);
    const deps = args.abs(Path.gen(src, { ext: ".d" }));

    const result = await args.spawn("clang", [
      ...cflags,
      "-o",
      o,
      "-MMD",
      "-MF",
      deps,
      s,
    ]);

    if (!result) return false;

    const depContents = await readFile(deps, "utf8");
    const escapedLines = depContents.replaceAll("\\\n", " ");

    const lines = escapedLines.split("\n");
    if (lines.length < 1) return result;

    const colonIndex = lines[0].indexOf(":");
    if (colonIndex < 0) return result;

    for (const postreq of lines[0].slice(colonIndex + 1).split(/ +/)) {
      if (!postreq) continue;

      args.addPostreq(postreq);
    }
  });

  make.add(compileCommands, async (args) => {
    const [j, s, o] = args.absAll(compileCommands, src, obj);

    const contents = JSON.stringify([
      {
        directory: make.buildRoot,
        file: s,
        output: o,
        arguments: ["clang", ...cflags, "-o", o, s],
      },
    ]);

    await writeFile(j, contents, "utf8");
  });
});
