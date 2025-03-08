import { cli, Path } from "esmakefile";
import { writeFile, readFile } from "node:fs/promises";
import { Distribution, addCompileCommands } from "esmakefile-cmake";

import { njxRender } from "./jslib/njxRender.mjs";

const pkgContents = await readFile('package.json', 'utf8');
const { version } = JSON.parse(pkgContents);

cli((make) => {
  make.add("all", []);

	const d = new Distribution(make, {
		name: 'unixsocket',
		version,
		cStd: 17,
		cxxStd: 20
	});

	const unix = d.addLibrary({
		name: 'unixsocket',
		src: ['src/unixsocket.c']
	});

	const gtest = d.findPackage('gtest_main');

	const test = d.addTest({
		name: 'unixsocket_test',
		src: ['test/test.cpp'],
		linkTo: [gtest, unix]
	});

	const cmds = addCompileCommands(make, d);

  const doxyfileTemplate = Path.src("Doxyfile.njk");
  const doxyfile = Path.build("Doxyfile");
  const html = Path.build("html/index.html");

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

	make.add("test", [test.run], () => {});
	make.add('docs', [html], () => {});
  make.add("all", [unix.binary, cmds]);
});
