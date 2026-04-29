import type { Command } from "../types.ts";
import { errorEmbed, successEmbed, warnEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "resume",
  aliases: ["unpause"],
  description: "Resume the paused track.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing in the queue.")] });
    }
    if (!queue.paused) {
      return message.reply({ embeds: [warnEmbed("Already playing.")] });
    }
    queue.resume();
    return message.reply({ embeds: [successEmbed(`${e("play")} Back on.`)] });
  },
};

export default cmd;
