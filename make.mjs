import { cli, Path } from "esmakefile";

cli((book) => {
  const src = Path.src("src/unixsocket.c");
  const obj = Path.gen(src, { ext: ".o" });
  const include = Path.src("include");

  const lib = Path.build("libunixsocket.dylib");
  book.add(lib, obj, (args) => {
    return args.spawn("clang", [
      "-dynamiclib",
      "-o",
      args.abs(lib),
      args.abs(obj),
    ]);
  });

  book.add(obj, src, (args) => {
    const [s, o, inc] = args.absAll(src, obj, include);
    return args.spawn("clang", ["-std=c17", "-c", "-o", o, s, "-I", inc]);
  });
});
