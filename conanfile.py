from conan import ConanFile

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
        self.run("npm install")
        self.run("node make.js")

    def package(self):
        self.copy("*.h", join(self.source_folder, "include"), join(self.package_folder, "include"), keep_path=False)
        self.copy("package*.json", self.source_folder, self.package_folder, keep_path=False)
