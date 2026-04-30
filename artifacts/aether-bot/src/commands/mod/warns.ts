import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { db } from "../../services/db.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const listWarns = db.prepare(
  `SELECT id, mod_id, reason, created_at FROM warns
   WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 15`,
);

const cmd: Command = {
  name: "warns",
  aliases: ["warnings"],
  description: "Show a user's warning history.",
  category: "mod",
  usage: "warns [@user]",
  run: async ({ message }) => {
    const target = message.mentions.users.first() ?? message.author;
    const rows = listWarns.all(message.guild!.id, target.id) as Array<{
      id: number;
      mod_id: string;
      reason: string;
      created_at: number;
    }>;
    if (!rows.length) {
      await message.reply(`${e("check")} ${target.tag} has a clean record.`);
      return;
    }
    const lines = rows.map(
      (w) => `\`#${String(w.id).padStart(3, "0")}\`\u2003<t:${Math.floor(w.created_at / 1000)}:R>\u2003·\u2003${w.reason}`,
    );
    const eb = baseEmbed()
      .setColor(Colors.warn)
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setDescription([h1(`${e("warning")}\u2003Warning Record`), GAP, ...lines].join("\n"));
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
