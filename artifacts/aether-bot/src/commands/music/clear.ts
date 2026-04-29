import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "clear",
  aliases: ["clearqueue", "cq"],
  description: "Clear the queue but keep playing the current track.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue || queue.songs.length <= 1) {
      return message.reply({ embeds: [errorEmbed("Queue is already empty.")] });
    }
    const removed = queue.songs.length - 1;
    queue.songs.splice(1);
    return message.reply({
      embeds: [successEmbed(`${e("cross")} Cleared **${removed}** track${removed === 1 ? "" : "s"}.`)],
    });
  },
};

export default cmd;
