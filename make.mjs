import { cli, Path } from "esmakefile";
import { writeFile, readFile } from "node:fs/promises";
import nunjucks from "nunjucks";

function njxRender(name, context) {
  return new Promise((resolve, reject) => {
    nunjucks.render(name, context, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(res);
    });
  });
}

cli((make) => {
  const src = Path.src("src/unixsocket.c");
  const include = Path.src("include");
  const compileCommands = Path.build("compile_commands.json");
  const lib = Path.build("libunixsocket.dylib");
  const doxyfileTemplate = Path.src("Doxyfile.njk");
  const doxyfile = Path.build("Doxyfile");
  const html = Path.build("html/index.html");

  const cflags = ["-c", "-std=c17", "-I", make.abs(include)];

  make.add("all", [lib, compileCommands, html]);

  const libs = [];

  for (const arch of ["x86_64", "arm64"]) {
    const obj = Path.gen(src, { ext: `${arch}.o` });
    const libArch = obj.dir().join(`libunixsocket-${arch}.dylib`);
    libs.push(libArch);

    make.add(libArch, obj, (args) => {
      return args.spawn("clang", [
        "-dynamiclib",
        "-arch",
        arch,
        "-o",
        args.abs(libArch),
        args.abs(obj),
      ]);
    });

    make.add(obj, src, async (args) => {
      const [s, o] = args.absAll(src, obj);
      const deps = args.abs(Path.gen(obj, { ext: ".d" }));

      const result = await args.spawn("clang", [
        ...cflags,
        "-arch",
        arch,
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
  }

  make.add(lib, libs, (args) => {
    return args.spawn("lipo", [
      "-create",
      "-output",
      args.abs(lib),
      ...args.absAll(...libs),
    ]);
  });

  make.add(compileCommands, async (args) => {
    const [j, s] = args.absAll(compileCommands, src);

    const contents = JSON.stringify([
      {
        directory: make.buildRoot,
        file: s,
        arguments: ["clang", ...cflags, s],
      },
    ]);

    await writeFile(j, contents, "utf8");
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
});
