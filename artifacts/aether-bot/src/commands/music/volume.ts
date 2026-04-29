import type { Command } from "../types.ts";
import { errorEmbed, successEmbed, warnEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";
import { config } from "../../config/index.ts";

const cmd: Command = {
  name: "volume",
  aliases: ["vol", "v"],
  description: "Set or show the player volume.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  usage: "+volume <0-200>",
  run: async ({ message, args, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing playing.")] });
    }
    if (!args[0]) {
      return message.reply({
        embeds: [successEmbed(`${e("volup")} Current volume: **${queue.volume}%**`)],
      });
    }
    const v = Math.floor(Number(args[0]));
    if (!Number.isFinite(v) || v < 0 || v > config.maxVolume) {
      return message.reply({
        embeds: [warnEmbed(`Volume must be 0-${config.maxVolume}.`)],
      });
    }
    queue.setVolume(v);
    const icon = v === 0 ? e("voldown") : v >= 100 ? e("volup") : e("voldown");
    return message.reply({
      embeds: [successEmbed(`${icon} Volume set to **${v}%**`)],
    });
  },
};

export default cmd;
