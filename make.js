import { cli } from "gulpachek";
import { C, platformCompiler } from "gulpachek-c";
import { globSync } from "glob";

cli((book) => {
  const c = new C(platformCompiler(), {
    book,
    cVersion: "C17",
  });

  book.add("all", []);

  const lib = c.addLibrary({
    name: "unixsocket",
    version: "0.1.0",
    includePaths: ["include"],
    src: globSync("src/*.c"),
  });

  book.add("all", lib);
});
