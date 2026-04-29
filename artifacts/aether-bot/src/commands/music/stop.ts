import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "stop",
  aliases: ["dc", "disconnect"],
  description: "Stop the music and clear the queue.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Already stopped.")] });
    }
    await queue.stop();
    return message.reply({ embeds: [successEmbed(`${e("stop")} Stopped. Queue wiped.`)] });
  },
};

export default cmd;
