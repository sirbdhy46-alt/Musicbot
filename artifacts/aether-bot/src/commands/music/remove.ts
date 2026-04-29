import type { Command } from "../types.ts";
import { errorEmbed, successEmbed, warnEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";
import { trunc } from "../../utils/format.ts";

const cmd: Command = {
  name: "remove",
  aliases: ["rm", "yeet"],
  description: "Remove a specific track from the queue.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  usage: "+remove <position>",
  run: async ({ message, args, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue || queue.songs.length <= 1) {
      return message.reply({ embeds: [errorEmbed("Queue is empty.")] });
    }
    const pos = Math.floor(Number(args[0]));
    if (!Number.isFinite(pos) || pos < 1 || pos >= queue.songs.length) {
      return message.reply({
        embeds: [warnEmbed(`Pick a position between 1 and ${queue.songs.length - 1}.`)],
      });
    }
    const [removed] = queue.songs.splice(pos, 1);
    return message.reply({
      embeds: [successEmbed(`${e("cross")} Removed **${trunc(removed?.name ?? "track", 60)}**`)],
    });
  },
};

export default cmd;
