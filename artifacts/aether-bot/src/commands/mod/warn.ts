import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { db } from "../../services/db.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const insertWarn = db.prepare(
  `INSERT INTO warns (guild_id, user_id, mod_id, reason, created_at) VALUES (?, ?, ?, ?, ?)`,
);
const countWarns = db.prepare(`SELECT COUNT(*) AS n FROM warns WHERE guild_id = ? AND user_id = ?`);

const cmd: Command = {
  name: "warn",
  description: "Issue a written warning to a user. Stored in the record.",
  category: "mod",
  usage: "warn @user <reason>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(`${e("lock")} you need **Moderate Members**.`);
      return;
    }
    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply("usage — `+warn @user <reason>`");
      return;
    }
    const reason = args.slice(1).join(" ").trim();
    if (!reason) {
      await message.reply("a reason is required.");
      return;
    }
    insertWarn.run(message.guild!.id, target.id, message.author.id, reason, Date.now());
    const total = (countWarns.get(message.guild!.id, target.id) as { n: number }).n;

    const gif = await vibeGif("warn", "anime warning");
    const eb = baseEmbed()
      .setColor(Colors.warn)
      .setDescription(
        [
          h1(`${e("warning")}\u2003Warning Logged`),
          GAP,
          `${b("User")}\u2003${target.user.tag}`,
          `${b("Reason")}\u2003${reason}`,
          `${b("Total Warns")}\u2003\`${total}\``,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
