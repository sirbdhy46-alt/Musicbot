import type { Command } from "../types.ts";
import { errorEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { EmbedBuilder } from "discord.js";
import { formatDuration, trunc } from "../../utils/format.ts";

const cmd: Command = {
  name: "queue",
  aliases: ["q", "list"],
  description: "Show the upcoming queue.",
  category: "music",
  queueOnly: true,
  run: async ({ message, args, distube }) => {
    const queue = distube.getQueue(message.guildId!);
    if (!queue || queue.songs.length === 0) {
      return message.reply({ embeds: [errorEmbed("Queue is empty.")] });
    }

    const page = Math.max(1, Number(args[0] ?? 1));
    const perPage = 10;
    const upNext = queue.songs.slice(1);
    const totalPages = Math.max(1, Math.ceil(upNext.length / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    const slice = upNext.slice(start, start + perPage);

    const np = queue.songs[0];
    const totalLeft = upNext.reduce((acc, s) => acc + (s.duration ?? 0), 0);

    const list = slice
      .map(
        (s, i) =>
          `\`${String(start + i + 1).padStart(2, "0")}\` ${e("music_note")} **${trunc(s.name ?? "Unknown", 55)}** \`[${formatDuration(s.duration ?? 0)}]\``,
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(Colors.secondary)
      .setAuthor({ name: "Queue" })
      .setTitle(`${e("queue")} ${queue.songs.length - 1} track${upNext.length === 1 ? "" : "s"} up next`)
      .setDescription(
        [
          `${e("play")} **Now:** ${trunc(np?.name ?? "Unknown", 55)} \`[${formatDuration(np?.duration ?? 0)}]\``,
          "",
          list || "_No upcoming tracks_",
        ].join("\n"),
      )
      .setFooter({
        text: `Page ${safePage}/${totalPages} • ${formatDuration(totalLeft)} of music left`,
      });

    return message.reply({ embeds: [embed] });
  },
};

export default cmd;
