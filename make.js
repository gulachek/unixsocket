import { cli, Path } from "esmakefile";
import { globSync } from "glob";

cli((book) => {
  const src = globSync("src/*.c").map((p) => Path.src(p));
  const obj = src.map((s) => Path.gen(s, { ext: ".o" }));
  const include = Path.src("include");

  const lib = Path.build("libunixsocket.dylib");
  book.add(lib, obj, (args) => {
    const out = args.abs(lib);
    const objs = args.absAll(...obj);

    return args.spawn("clang", ["-dynamiclib", "-o", out, ...objs]);
  });

  for (let i = 0; i < obj.length; ++i) {
    book.add(obj[i], src[i], (args) => {
      const [s, o, inc] = args.absAll(src[i], obj[i], include);
      return args.spawn("clang", ["-std=c17", "-c", "-o", o, s, "-I", inc]);
    });
  }
});
