import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "leave",
  aliases: ["l", "fuckoff", "bye"],
  description: "Leave the voice channel.",
  category: "music",
  voiceOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    const voice = distube.voices.get(message.guildId!);
    if (!queue && !voice) {
      return message.reply({ embeds: [errorEmbed("I'm not in a voice channel.")] });
    }
    if (queue) await queue.stop();
    voice?.leave();
    return message.reply({
      embeds: [successEmbed(`${e("stop")} Peace out.`)],
    });
  },
};

export default cmd;
