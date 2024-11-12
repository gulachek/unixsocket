from conan import ConanFile
from conan.tools.files import chdir, copy
from conan.tools.gnu import PkgConfigDeps
from os.path import join

class BasicConanfile(ConanFile):
    name = "unixsocket"
    version = "0.1.0"
    description = "Unix Domain Socket system call convenience wrappers"
    license = "MIT"
    homepage = "https://gulachek.com"
    test_requires = "gtest/1.15.0"
    generators = "PkgConfigDeps"

    def source(self):
        self.run("git clone git@github.com:gulachek/unixsocket.git")

    # This method is used to build the source code of the recipe using the desired commands.
    def build(self):
        with chdir(self, 'libunixsocket'):
            self.run("npm install")
            self.run("node make.js")

    def package(self):
        d = join(self.source_folder, 'libunixsocket')
        build = join(d, "build")
        include = join(d, "include")
        copy(self, "*.h", include, join(self.package_folder, "include"))
        copy(self, "libunixsocket.dylib", build, join(self.package_folder, "lib"))
        copy(self, "package*.json", d, self.package_folder)

    def package_info(self):
        self.cpp_info.libs = ["unixsocket"]
