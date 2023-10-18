from conan import ConanFile
from conan.tools.files import chdir

class BasicConanfile(ConanFile):
    name = "unixsocket"
    version = "0.1.0"
    description = "Unix Domain Socket system call convenience wrappers"
    license = "MIT"
    homepage = "https://gulachek.com"

    def source(self):
        self.run("git clone ~/Code/projects/libunixsocket")

    def requirements(self):
        pass

    def build_requirements(self):
        # TODO - node and npm install?
        pass

    def generate(self):
        pass

    # This method is used to build the source code of the recipe using the desired commands.
    def build(self):
        with chdir(self, 'libunixsocket'):
            self.run("npm install")
            self.run("ls node_modules")
            self.run("node make.js")

    def package(self):
        self.run("pwd")
        self.run("ls")
        d = join(self.source_folder, 'libunixsocket')
        self.copy("*.h", join(d, "include"), join(self.package_folder, "include"), keep_path=False)
        self.copy("package*.json", d, self.package_folder, keep_path=False)
