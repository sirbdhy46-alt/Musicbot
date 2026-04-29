import type { Command } from "../types.ts";
import { EmbedBuilder } from "discord.js";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { detectSource, trunc } from "../../utils/format.ts";
import { logger } from "../../utils/logger.ts";

const isUrl = (s: string): boolean => /^https?:\/\//i.test(s);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YTDLP_BIN = path.resolve(__dirname, "../../../bin/yt-dlp");

// Resolve a free-text search to a real YouTube URL via the yt-dlp binary directly.
// We do this so DisTube never falls back to SoundCloud's searchSongs (which is
// rate-limited from cloud IPs) when the user types a plain search query.
const searchYouTube = (query: string): Promise<string | null> =>
  new Promise((resolve) => {
    const child = spawn(
      YTDLP_BIN,
      [
        `ytsearch1:${query}`,
        "--get-id",
        "--no-playlist",
        "--no-warnings",
        "--default-search",
        "ytsearch",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.on("error", () => resolve(null));
    child.on("close", () => {
      const id = out.trim().split("\n").filter(Boolean)[0];
      resolve(id ? `https://www.youtube.com/watch?v=${id}` : null);
    });
    // Hard timeout so we never hang the play command
    setTimeout(() => {
      child.kill("SIGKILL");
      resolve(null);
    }, 15_000);
  });

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

    // For URLs we pass straight through. For free text, resolve the search
    // ourselves with the yt-dlp binary so DisTube cannot fall back to
    // SoundCloud's rate-limited search path.
    let target = query;
    if (!url) {
      const resolved = await searchYouTube(query);
      if (!resolved) {
        await searching.edit({
          embeds: [
            errorEmbed(
              [
                `**No results for that search.**`,
                `> \`${trunc(query, 200)}\``,
                "",
                `Try a different search term or paste a direct URL.`,
              ].join("\n"),
            ),
          ],
        });
        return;
      }
      target = resolved;
    }

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
