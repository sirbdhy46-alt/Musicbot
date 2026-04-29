import { EmbedBuilder } from "discord.js";
import type { Queue as DQueue } from "distube";
import { Colors } from "../config/colors.ts";
import { e, type EmojiName } from "../config/emojis.ts";
import { formatDuration, progressBar, detectSource, trunc } from "../utils/format.ts";

export const buildNowPlayingEmbed = (queue: DQueue): EmbedBuilder => {
  const song = queue.songs[0];
  if (!song) {
    return new EmbedBuilder()
      .setColor(Colors.bg)
      .setTitle(`${e("music_note")} Nothing playing`)
      .setDescription("Queue is empty. Drop a track with `+play <song>`.");
  }

  const sourceKey = detectSource(song.url ?? "") as EmojiName | "other";
  const sourceTag =
    sourceKey === "other" ? "" : `${e(sourceKey as EmojiName)} `;

  const isPaused = queue.paused;
  const stateIcon = isPaused ? e("pause") : e("play");
  const bar = progressBar(queue.currentTime, song.duration ?? 0, 18);

  const embed = new EmbedBuilder()
    .setColor(isPaused ? Colors.info : Colors.primary)
    .setAuthor({ name: isPaused ? "Paused" : "Now Playing" })
    .setTitle(`${stateIcon} ${trunc(song.name ?? "Unknown", 90)}`)
    .setURL(song.url ?? null)
    .setDescription(
      [
        `${sourceTag}${song.uploader?.name ? `**${song.uploader.name}**` : ""}`,
        "",
        `\`${formatDuration(queue.currentTime)}\` ${bar} \`${formatDuration(song.duration ?? 0)}\``,
      ].join("\n"),
    )
    .addFields(
      {
        name: `${e("queue")} Up Next`,
        value: queue.songs[1]?.name
          ? trunc(queue.songs[1].name, 60)
          : "_Empty — queue something fire_",
        inline: true,
      },
      {
        name: `${e("volup")} Volume`,
        value: `\`${queue.volume}%\``,
        inline: true,
      },
      {
        name: `${e("loop")} Loop`,
        value:
          queue.repeatMode === 2
            ? "Queue"
            : queue.repeatMode === 1
              ? "Track"
              : "Off",
        inline: true,
      },
    )
    .setFooter({
      text: `Requested by ${song.user?.username ?? "Unknown"} • ${queue.songs.length} in queue`,
    });

  if (song.thumbnail) embed.setThumbnail(song.thumbnail);

  return embed;
};
