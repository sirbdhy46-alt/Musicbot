import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "unmute",
  aliases: ["untimeout"],
  description: "Lift a user's timeout.",
  category: "mod",
  usage: "unmute @user",
  run: async ({ message }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(`${e("lock")} you need **Moderate Members**.`);
      return;
    }
    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply("usage — `+unmute @user`");
      return;
    }
    try {
      await target.timeout(null, `lifted by ${message.author.tag}`);
    } catch {
      await message.reply(`${e("cross")} couldn't lift the timeout.`);
      return;
    }
    const eb = baseEmbed()
      .setColor(Colors.success)
      .setDescription(
        [
          h1(`${e("check")}\u2003Voice Restored`),
          GAP,
          `${b("User")}\u2003${target.user.tag}`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
