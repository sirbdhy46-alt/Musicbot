import type { Command } from "../types.ts";
import { errorEmbed, successEmbed } from "../../embeds/builder.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "join",
  aliases: ["j", "summon"],
  description: "Have the bot join your voice channel.",
  category: "music",
  voiceOnly: true,
  run: async ({ message, distube }) => {
    const voice = message.member?.voice.channel;
    if (!voice) {
      return message.reply({ embeds: [errorEmbed("Hop in a voice channel first.")] });
    }
    try {
      await distube.voices.join(voice);
      return message.reply({
        embeds: [successEmbed(`${e("sparkle")} Connected to **${voice.name}**`)],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return message.reply({ embeds: [errorEmbed(`Could not join: ${msg.slice(0, 200)}`)] });
    }
  },
};

export default cmd;
