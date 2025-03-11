import {config, config_write} from "./core.ts";
import {parseArgs} from "@std/cli"
import {walk} from "@std/fs"
import { format, normalize, parse } from "@std/path";
import { copy } from "jsr:@std/bytes@^1.0.2/copy";

const dirExists = async (dir: string, name: string) => {
    for await (const entry of Deno.readDir(dir)) {
        if (entry.name === name) {
            return true;
        }
    }
    return false;
};

const c = await config();

const args = parseArgs(Deno.args)

switch (args._[0]) {
    case "config":
        if (args._[1]&&args._[1] === "reset") {
            Deno.remove("config.json");
        } else
        if (args._[1]&&args._[2]) {
            config_write({[args._[1]]:args._[2]});
        } else
        if (args._[1]) {
            console.log(c[args._[1]]);
        } else {
            console.log(c);
        }
        break;
    case "save": {
        if (!args._[1]) {
            console.log("No save name found");
            break;
        }
        if (await dirExists(c.SaveDir, args._[1] as string)) {
            console.log("Save name already exists");
            break;
        }
        const a = await Array.fromAsync(walk(c.DeskTopDir));
        a.forEach(async (v) => {
            if (v.isFile||v.isSymlink) {
                const fileContent = await Deno.readFile(v.path);
                const relativePath = v.path.replace(c.DeskTopDir, '');
                const targetPath = `${c.SaveDir}/${args._[1]}/${relativePath}`;
                await Deno.writeFile(targetPath, fileContent);
            } else if (v.isDirectory) {
                const relativePath = v.path.replace(c.DeskTopDir, '');
                const targetPath = `${c.SaveDir}/${args._[1]}${relativePath}`;
                await Deno.mkdir(targetPath, {recursive: true});
            }
        })
        break;
    }
    case "desktop":{
        if (!args._[1]) {
            console.log("No save name found");
            break;
        }
        if (args._[1] === "list") {
            const saves = await Array.fromAsync(Deno.readDir(c.SaveDir));
            console.log(saves.map((v) => v.name).join("\n"));
            break;
        }
        if (args._[1] === "clean") {
            const response = prompt("Are you sure you want to clean the desktop? This will remove all files on the desktop. (y/n)");
            if (response && response.toLowerCase() === 'y') {
                for await (const entry of Deno.readDir(c.DeskTopDir)) {
                    await Deno.remove(`${c.DeskTopDir}/${entry.name}`, { recursive: true });
                }
                console.log("Desktop has been cleaned.");
            } else {
                console.log("Operation cancelled.");
            }
        }
        if (args._[1] === "chenge") {
            const response = prompt("Are you sure you want to change the desktop? This will remove the current desktop files. (y/n)");
            if (response && response.toLowerCase() === 'y') {
                for await (const entry of Deno.readDir(c.DeskTopDir)) {
                    await Deno.remove(`${c.DeskTopDir}/${entry.name}`, { recursive: true });
                }
                const saveDir = `${c.SaveDir}/${args._[2]}`;
                for await (const entry of walk(saveDir)) {
                    const relativePath = entry.path.replace(format(parse(`${c.SaveDir}/${args._[2]}`)), '');
                    const targetPath = `${c.DeskTopDir}/${relativePath}`;
                    if (entry.isFile || entry.isSymlink) {
                        const fileContent = await Deno.readFile(entry.path);
                        await Deno.writeFile(targetPath, fileContent);
                    } else if (entry.isDirectory) {
                        await Deno.mkdir(normalize(targetPath), { recursive: true });
                    }
                }
                console.log("Desktop has been changed.");
            } else {
                console.log("Operation cancelled.");
            }
            break;
        }
        break;
    }
    default:
        console.log("No command found");
        break;
}