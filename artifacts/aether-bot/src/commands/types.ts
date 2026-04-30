import type { Message } from "discord.js";
import type { DisTube } from "distube";

export interface CommandContext {
  message: Message<true>;
  args: string[];
  raw: string;
  distube: DisTube;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  category:
    | "music"
    | "filter"
    | "info"
    | "admin"
    | "fun"
    | "economy"
    | "mod"
    | "security"
    | "util";
  usage?: string;
  voiceOnly?: boolean;
  queueOnly?: boolean;
  djOnly?: boolean;
  ownerOnly?: boolean;
  premium?: boolean;
  run: (ctx: CommandContext) => Promise<unknown> | unknown;
}
