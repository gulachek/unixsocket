import { cli } from "esmakefile";
import { Distribution } from "esmakefile-cmake";

cli((make) => {
  const d = new Distribution(make, {
    name: "test",
    version: "1.2.3",
  });

  const unixsocket = d.findPackage("unixsocket");

  const test = d.addTest({
    name: "test",
    src: ["test.c"],
    linkTo: [unixsocket],
  });

  make.add("test", [test.run], () => {});
});
