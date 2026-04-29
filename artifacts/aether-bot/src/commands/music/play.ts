import type { Command } from "../types.ts";
import { EmbedBuilder } from "discord.js";
import { errorEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { detectSource, trunc } from "../../utils/format.ts";
import { logger } from "../../utils/logger.ts";

const isUrl = (s: string): boolean => /^https?:\/\//i.test(s);

const cmd: Command = {
  name: "play",
  aliases: ["p"],
  description: "Play a track or add to the queue (YouTube, SoundCloud, Spotify link).",
  category: "music",
  usage: "+play <song name or url>",
  voiceOnly: true,
  run: async ({ message, raw, distube }) => {
    const query = raw.trim();
    if (!query) {
      await message.reply({
        embeds: [errorEmbed("Give me something to play. `+play <song or url>`")],
      });
      return;
    }

    const member = message.member;
    const voice = member?.voice.channel;
    if (!voice) {
      await message.reply({
        embeds: [errorEmbed("Hop in a voice channel first.")],
      });
      return;
    }

    const url = isUrl(query);
    const sourceKey = url ? detectSource(query) : "search";
    const sourceLabel =
      sourceKey === "youtube" ? `${e("youtube")} **YouTube**` :
      sourceKey === "soundcloud" ? `${e("soundcloud")} **SoundCloud**` :
      sourceKey === "spotify" ? `${e("spotify")} **Spotify**` :
      `${e("search")} **YouTube Search**`;

    const searching = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.info)
          .setAuthor({ name: "Aether" })
          .setTitle(`${e("loading")}  **${url ? "Resolving track" : "Searching"}…**`)
          .setDescription(
            [
              `${sourceLabel}`,
              `> \`${trunc(query, 200)}\``,
              "",
              `${e("headset")}  Joining **${voice.name}**…`,
            ].join("\n"),
          ),
      ],
    });

    // For non-URL queries, hand the search to yt-dlp via its native ytsearch: prefix.
    // YtDlpPlugin.validate() returns true for any string, but ytsearch:N:query is what
    // the underlying yt-dlp binary actually understands as "search YouTube".
    const target = url ? query : `ytsearch1:${query}`;

    try {
      await distube.play(voice, target, {
        member,
        textChannel: message.channel.isTextBased() ? message.channel : undefined,
        message,
      });
      // Cleanup the searching message after 4 seconds — PLAY_SONG embed takes over
      setTimeout(() => {
        searching.delete().catch(() => {});
      }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(
        `play.ts failed for "${query}" in guild ${message.guildId ?? "?"}: ${msg}`,
        err,
      );
      await searching.edit({
        embeds: [
          errorEmbed(
            [
              `**Could not play that.**`,
              `> \`${msg.slice(0, 300)}\``,
              "",
              `Try a direct URL or a different search term.`,
            ].join("\n"),
          ),
        ],
      });
    }
  },
};

export default cmd;
