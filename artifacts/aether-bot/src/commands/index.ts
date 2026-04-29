import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Command } from "./types.ts";
import { logger } from "../utils/logger.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const commands = new Map<string, Command>();
export const aliasIndex = new Map<string, string>();

const SUB_DIRS = ["music", "filter", "info", "admin", "fun"] as const;

export const loadCommands = async (): Promise<void> => {
  for (const dir of SUB_DIRS) {
    const full = path.join(__dirname, dir);
    let entries: string[] = [];
    try {
      entries = await readdir(full);
    } catch {
      continue;
    }
    for (const file of entries) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
      const url = pathToFileURL(path.join(full, file)).href;
      const mod = (await import(url)) as { default?: Command };
      const cmd = mod.default;
      if (!cmd?.name || !cmd.run) {
        logger.warn(`Skipped malformed command: ${dir}/${file}`);
        continue;
      }
      commands.set(cmd.name, cmd);
      cmd.aliases?.forEach((a) => aliasIndex.set(a, cmd.name));
    }
  }
  logger.ready(`Loaded ${commands.size} commands`);
};

export const resolveCommand = (name: string): Command | undefined => {
  const lower = name.toLowerCase();
  return commands.get(lower) ?? commands.get(aliasIndex.get(lower) ?? "");
};
