import {build} from "https://deno.land/x/esbuild@v0.25.1/mod.js"
import {denoPlugins} from "jsr:@luca/esbuild-deno-loader"

const platforms = ["x86_64-pc-windows-msvc","x86_64-apple-darwin","aarch64-apple-darwin","x86_64-unknown-linux-gnu","aarch64-unknown-linux-gnu"];

const b = await build({
    minify: true,
    bundle: true,
    entryPoints: ["./main.tsx"],
    outdir: "./build",
    platform:"node",
    plugins:[...denoPlugins()],
    treeShaking : true,
    format : "esm",
})

//clean dist folder
await Deno.remove("./dist",{recursive:true});
await Deno.mkdir("./dist");

platforms.forEach(platform => {
    const args = [
        "compile",
        // "--include=./index.html",
        `--output=./dist/main-${platform}`,
        `--target=${platform}`,
        "./build/main.js"
    ];

    if (platform === "x86_64-pc-windows-msvc") {
        args.push("--no-terminal");
    }

    const cmd = new Deno.Command(Deno.execPath(), {
        args: args,
    });
    cmd.spawn().status.then((status) => {
        Deno.exit(status.code);
    });
})