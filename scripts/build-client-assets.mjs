import * as fs from "node:fs/promises";
import * as path from "node:path";
import cssnano from "cssnano";
import postcss from "postcss";
import * as terser from "terser";

import locales from "../locales/index.js";
import meta from "../package.json" with { type: "json" };

async function copyClientFonts() {
    await fs.cp("./packages/client/node_modules/three/examples/fonts", "./built/_client_dist_/fonts", { dereference: true, recursive: true });
}

async function copyClientTablerIcons() {
    await fs.cp("./packages/client/node_modules/@tabler/icons-webfont", "./built/_client_dist_/tabler-icons", { dereference: true, recursive: true });
}

async function copyClientLocales() {
    await fs.mkdir("./built/_client_dist_/locales", { recursive: true });

    const v = { "_version_": meta.version };

    for (const [lang, locale] of Object.entries(locales)) {
        await fs.writeFile(`./built/_client_dist_/locales/${lang}.${meta.version}.json`, JSON.stringify({ ...locale, ...v }), "utf-8");
    }
}

async function copyBackendViews() {
    await fs.cp("./packages/backend/src/server/web/views", "./packages/backend/built/server/web/views", { recursive: true });
}

async function buildBackendScript() {
    await fs.mkdir("./packages/backend/built/server/web", { recursive: true });

    for (const file of [
        "./packages/backend/src/server/web/boot.js",
        "./packages/backend/src/server/web/bios.js",
        "./packages/backend/src/server/web/cli.js"
    ]) {
        let source = await fs.readFile(file, { encoding: "utf-8" });
        source = source.replaceAll("LANGS", JSON.stringify(Object.keys(locales)));
        const { code } = await terser.minify(source, { toplevel: true });
        await fs.writeFile(`./packages/backend/built/server/web/${path.basename(file)}`, code);
    }
}

async function buildBackendStyle() {
    await fs.mkdir("./packages/backend/built/server/web", { recursive: true });

    for (const file of [
        "./packages/backend/src/server/web/style.css",
        "./packages/backend/src/server/web/bios.css",
        "./packages/backend/src/server/web/cli.css",
    ]) {
        const source = await fs.readFile(file, { encoding: "utf-8" });
        const { css } = await postcss([cssnano({ zindex: false })]).process(source, { from: undefined });
        await fs.writeFile(`./packages/backend/built/server/web/${path.basename(file)}`, css);
    }
}

async function build() {
    await Promise.all([
        copyClientFonts(),
        copyClientTablerIcons(),
        copyClientLocales(),
        copyBackendViews(),
        buildBackendScript(),
        buildBackendStyle(),
    ]);
}

await build();

if (process.argv.includes("--watch")) {
    const watcher = fs.watch("./packages", { recursive: true });
    for await (const event of watcher) {
        if (/^[a-z]+\/src/.test(event.filename)) {
            await build();
        }
    }
}
