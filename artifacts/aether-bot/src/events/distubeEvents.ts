import { EmbedBuilder, type GuildTextBasedChannel } from "discord.js";
import { type DisTube, Events } from "distube";
import { Colors } from "../config/colors.ts";
import { e, type EmojiName } from "../config/emojis.ts";
import { detectSource, formatDuration, trunc } from "../utils/format.ts";
import { logger } from "../utils/logger.ts";

const isText = (
  c: unknown,
): c is GuildTextBasedChannel & { send: GuildTextBasedChannel["send"] } =>
  !!c && typeof (c as { send?: unknown }).send === "function";

export const wireDistubeEvents = (distube: DisTube): void => {
  distube
    .on(Events.PLAY_SONG, (queue, song) => {
      if (!isText(queue.textChannel)) return;
      const sourceKey = detectSource(song.url ?? "") as EmojiName | "other";
      const sourceTag = sourceKey === "other" ? "" : `${e(sourceKey as EmojiName)} `;
      const embed = new EmbedBuilder()
        .setColor(Colors.primary)
        .setAuthor({ name: "Now Playing" })
        .setTitle(`${e("playing")} ${trunc(song.name ?? "Unknown", 90)}`)
        .setURL(song.url ?? null)
        .setDescription(
          [
            `${sourceTag}${song.uploader?.name ? `**${song.uploader.name}**` : ""}`,
            `\`${formatDuration(song.duration ?? 0)}\``,
          ].join("\n"),
        )
        .setFooter({
          text: `Requested by ${song.user?.username ?? "Unknown"} • ${queue.songs.length - 1} up next`,
        });
      if (song.thumbnail) embed.setThumbnail(song.thumbnail);
      void queue.textChannel.send({ embeds: [embed] }).catch(() => {});
    })
    .on(Events.ADD_SONG, (queue, song) => {
      if (!isText(queue.textChannel)) return;
      if (queue.songs.length <= 1) return;
      const embed = new EmbedBuilder()
        .setColor(Colors.success)
        .setTitle(`${e("queue")} Added to queue`)
        .setDescription(`**${trunc(song.name ?? "Unknown", 90)}** \`[${formatDuration(song.duration ?? 0)}]\``)
        .setFooter({ text: `Position #${queue.songs.length - 1}` });
      void queue.textChannel.send({ embeds: [embed] }).catch(() => {});
    })
    .on(Events.ADD_LIST, (queue, playlist) => {
      if (!isText(queue.textChannel)) return;
      const embed = new EmbedBuilder()
        .setColor(Colors.fire)
        .setTitle(`${e("fire")} Playlist queued`)
        .setDescription(
          `**${trunc(playlist.name ?? "Playlist", 90)}** — ${playlist.songs.length} tracks`,
        );
      void queue.textChannel.send({ embeds: [embed] }).catch(() => {});
    })
    .on(Events.DISCONNECT, (queue) => {
      if (!isText(queue.textChannel)) return;
      void queue.textChannel
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.warn)
              .setDescription(`${e("warning")} Disconnected from voice.`),
          ],
        })
        .catch(() => {});
    })
    .on(Events.FINISH, (queue) => {
      if (!isText(queue.textChannel)) return;
      void queue.textChannel
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.info)
              .setDescription(`${e("sparkle")} Queue finished. Drop another track.`),
          ],
        })
        .catch(() => {});
    })
    .on(Events.ERROR, (err, queue) => {
      logger.error(`DisTube error in guild ${queue?.id ?? "?"}`, err);
      if (queue && isText(queue.textChannel)) {
        const msg = err instanceof Error ? err.message : String(err);
        void queue.textChannel
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.danger)
                .setTitle(`${e("cross")} **Player error**`)
                .setDescription(`\`${msg.slice(0, 300)}\``),
            ],
          })
          .catch(() => {});
      }
    });

  // Autoplay couldn't find a related track — surface to channel
  distube.on(Events.NO_RELATED, (queue, err) => {
    logger.warn(`NO_RELATED in guild ${queue.id}: ${err.message}`);
    if (!isText(queue.textChannel)) return;
    void queue.textChannel
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.warn)
            .setTitle(`${e("warning")} **Autoplay dead-end**`)
            .setDescription(`No related tracks found. Drop another with \`+play <song>\`.`),
        ],
      })
      .catch(() => {});
  });

  // Surface ffmpeg/stream debug as warnings only (helps diagnose silent playback fails)
  distube.on(Events.FFMPEG_DEBUG, (msg) => {
    if (msg.toLowerCase().includes("error")) {
      logger.warn(`FFmpeg: ${msg.slice(0, 200)}`);
    }
  });
};
