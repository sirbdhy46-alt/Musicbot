import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "autoplay",
  aliases: ["ap"],
  description: "Toggle autoplay — bot keeps the vibe going after the queue ends.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing playing.")] });
    }
    const enabled = queue.toggleAutoplay();
    return message.reply({
      embeds: [successEmbed(`${e("autoplay")} Autoplay **${enabled ? "ON" : "OFF"}**`)],
    });
  },
};

export default cmd;
