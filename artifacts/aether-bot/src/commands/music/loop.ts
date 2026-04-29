import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "loop",
  aliases: ["repeat"],
  description: "Toggle loop mode: off / track / queue.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  usage: "+loop [off|track|queue]",
  run: async ({ message, args, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing playing.")] });
    }
    const arg = (args[0] ?? "").toLowerCase();
    let mode: 0 | 1 | 2;
    if (arg === "off" || arg === "0") mode = 0;
    else if (arg === "track" || arg === "song" || arg === "1") mode = 1;
    else if (arg === "queue" || arg === "all" || arg === "2") mode = 2;
    else mode = (((queue.repeatMode + 1) % 3) as 0 | 1 | 2);

    queue.setRepeatMode(mode);
    const label = mode === 0 ? "Off" : mode === 1 ? "Track" : "Queue";
    return message.reply({
      embeds: [successEmbed(`${e("loop")} Loop mode: **${label}**`)],
    });
  },
};

export default cmd;
