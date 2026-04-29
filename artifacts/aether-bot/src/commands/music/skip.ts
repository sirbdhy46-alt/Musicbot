import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "skip",
  aliases: ["s", "next"],
  description: "Skip to the next track.",
  category: "music",
  voiceOnly: true,
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing playing.")] });
    }
    try {
      if (queue.songs.length <= 1 && !queue.autoplay) {
        await queue.stop();
        return message.reply({ embeds: [successEmbed(`${e("stop")} End of queue.`)] });
      }
      await queue.skip();
      return message.reply({ embeds: [successEmbed(`${e("skip")} Skipped.`)] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return message.reply({ embeds: [errorEmbed(`Skip failed: ${msg.slice(0, 200)}`)] });
    }
  },
};

export default cmd;
