import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "shuffle",
  aliases: ["mix"],
  description: "Shuffle the queue.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue || queue.songs.length < 3) {
      return message.reply({ embeds: [errorEmbed("Need 2+ tracks in queue to shuffle.")] });
    }
    queue.shuffle();
    return message.reply({
      embeds: [successEmbed(`${e("shuffle")} Queue shuffled.`)],
    });
  },
};

export default cmd;
