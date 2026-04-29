import type { Command } from "../types.ts";
import { errorEmbed } from "../../embeds/builder.ts";
import { buildNowPlayingEmbed } from "../../embeds/nowPlaying.ts";

const cmd: Command = {
  name: "nowplaying",
  aliases: ["np", "current"],
  description: "Show what's currently playing.",
  category: "music",
  queueOnly: true,
  run: async ({ message, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue) {
      return message.reply({ embeds: [errorEmbed("Nothing playing.")] });
    }
    return message.reply({ embeds: [buildNowPlayingEmbed(queue)] });
  },
};

export default cmd;
