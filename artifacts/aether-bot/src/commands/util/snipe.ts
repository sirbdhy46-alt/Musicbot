import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { db } from "../../services/db.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const get = db.prepare(
  `SELECT author_id, content, deleted_at FROM snipes WHERE channel_id = ?`,
);

const cmd: Command = {
  name: "snipe",
  description: "Reveal the most recently deleted message in this channel.",
  category: "util",
  run: async ({ message }) => {
    const row = get.get(message.channelId) as
      | { author_id: string; content: string; deleted_at: number }
      | undefined;
    if (!row) {
      await message.reply(`${e("warning")} nothing to snipe in here.`);
      return;
    }
    const author = await message.client.users.fetch(row.author_id).catch(() => null);
    const eb = baseEmbed()
      .setColor(Colors.danger)
      .setAuthor(
        author
          ? { name: author.tag, iconURL: author.displayAvatarURL() }
          : { name: "unknown" },
      )
      .setDescription(
        [
          h1(`${e("fire")}\u2003Sniped`),
          GAP,
          row.content.slice(0, 1500),
          GAP,
          `_deleted <t:${Math.floor(row.deleted_at / 1000)}:R>_`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
