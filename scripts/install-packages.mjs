import { execa } from "execa";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    console.log("installing dependencies of packages/backend ...");

    await execa("pnpm", ["--force", "install"], {
        cwd: __dirname + "/../packages/backend",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log("installing dependencies of packages/client ...");

    await execa("pnpm", ["install"], {
        cwd: __dirname + "/../packages/client",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log("installing dependencies of packages/sw ...");

    await execa("pnpm", ["install"], {
        cwd: __dirname + "/../packages/sw",
        stdout: process.stdout,
        stderr: process.stderr,
    });
})();
