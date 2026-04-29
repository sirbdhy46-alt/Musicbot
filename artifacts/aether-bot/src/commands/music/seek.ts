import type { Command } from "../types.ts";
import { errorEmbed, successEmbed, warnEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";
import { formatDuration } from "../../utils/format.ts";

const parseTime = (input: string): number => {
  if (input.includes(":")) {
    const parts = input.split(":").map(Number);
    if (parts.some((n) => Number.isNaN(n))) return NaN;
    return parts.reduce((acc, n) => acc * 60 + n, 0);
  }
  return Number(input);
};

const cmd: Command = {
  name: "seek",
  description: "Jump to a specific time in the current track.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  usage: "+seek <seconds | mm:ss>",
  run: async ({ message, args, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing playing.")] });
    }
    if (!args[0]) {
      return message.reply({ embeds: [warnEmbed("Usage: `+seek 1:23`")] });
    }
    const target = parseTime(args[0]);
    const max = queue.songs[0]?.duration ?? 0;
    if (!Number.isFinite(target) || target < 0 || target > max) {
      return message.reply({
        embeds: [warnEmbed(`Pick a time between 0 and ${formatDuration(max)}.`)],
      });
    }
    queue.seek(target);
    return message.reply({
      embeds: [successEmbed(`${e("skip")} Jumped to \`${formatDuration(target)}\``)],
    });
  },
};

export default cmd;
