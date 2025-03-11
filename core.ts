import {join} from "@std/path"

export interface Config {
    [key: string]: string|number;
    DeskTopDir: string;
    SaveDir: string;
}

export function config(): Promise<Config> {
    return Deno.readTextFile("config.json").then((data) => {
        if (!data) {
            return defaultConfig;
        }
        return JSON.parse(data);
    }).catch(() => {
        return defaultConfig;
    });
}

const homeDir = (Deno.build.os === "windows"
  ? Deno.env.get("USERPROFILE")
  : Deno.env.get("HOME"))||"~";

const defaultConfig:Config = {
    DeskTopDir: `${join(homeDir, "Desktop")}`,
    SaveDir: `${join(Deno.cwd(),"save")}`
}

export function config_write(input:Partial<Config> = {}) {
    Deno.stat("config.json").then(() => {
        return Deno.readTextFile("config.json");
    }).then((data) => {
        const C = { ...JSON.parse(data), ...input };
        Deno.writeTextFile("config.json", JSON.stringify(C));
    }).catch(() => {
        const C = { ...defaultConfig, ...input };
        Deno.writeTextFile("config.json", JSON.stringify(C));
    });
}