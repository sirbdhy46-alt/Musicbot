import type { Command } from "../types.ts";
import { errorEmbed, successEmbed, warnEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "pause",
  description: "Pause the current track.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing to pause.")] });
    }
    if (queue.paused) {
      return message.reply({ embeds: [warnEmbed("Already paused. Use `+resume`.")] });
    }
    queue.pause();
    return message.reply({ embeds: [successEmbed(`${e("pause")} Paused.`)] });
  },
};

export default cmd;
