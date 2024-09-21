import { cli, Path } from "esmakefile";
import { writeFile } from "node:fs/promises";

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

  make.add(obj, src, (args) => {
    const [s, o] = args.absAll(src, obj);
    return args.spawn("clang", [...cflags, "-o", o, s]);
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
