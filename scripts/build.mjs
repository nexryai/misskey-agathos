import { execa } from "execa";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    console.log(`building packages/misskey-js ...`);

    await execa("npm", ["run", "build"], {
        cwd: __dirname + "/../packages/misskey-js",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log(`building packages/backend ...`);

    await execa("npm", ["run", "build"], {
        cwd: __dirname + "/../packages/backend",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log("building packages/client ...");

    await execa("npm", ["run", "build"], {
        cwd: __dirname + "/../packages/client",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log("building packages/sw ...");

    await execa("npm", ["run", "build"], {
        cwd: __dirname + "/../packages/sw",
        stdout: process.stdout,
        stderr: process.stderr,
    });

    console.log("build finishing ...");

    await execa("npm", ["run", "build-assets"], {
        cwd: __dirname + "/../",
        stdout: process.stdout,
        stderr: process.stderr,
    });
})();
