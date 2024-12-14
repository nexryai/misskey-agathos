const execa = require("execa");
const {fileURLToPath} = require("node:url");
const {dirname} = require("node:path");

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    console.log("linting packages/backend ...");
    await execa("npm", ["run", "lint"], {
        cwd: __dirname + "/../packages/backend",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log("linting packages/client ...");
    await execa("npm", ["run", "lint"], {
        cwd: __dirname + "/../packages/client",
        stdout: process.stdout,
        stderr: process.stderr,
    });
})();
