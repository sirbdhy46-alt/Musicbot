import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "kick",
  description: "Kick a user from the server.",
  category: "mod",
  usage: "kick @user [reason]",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
      await message.reply(`${e("lock")} you need **Kick Members**.`);
      return;
    }
    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply("usage — `+kick @user [reason]`");
      return;
    }
    if (!target.kickable) {
      await message.reply(`${e("cross")} I can't kick that user.`);
      return;
    }
    const reason = args.slice(1).join(" ") || "no reason given";
    try {
      await target.kick(`${message.author.tag}: ${reason}`);
    } catch {
      await message.reply(`${e("cross")} kick failed.`);
      return;
    }

    const gif = await vibeGif("kick", "anime kick out");
    const eb = baseEmbed()
      .setColor(Colors.warn)
      .setDescription(
        [
          h1(`${e("warning")}\u2003User Kicked`),
          GAP,
          `${b("User")}\u2003${target.user.tag}`,
          `${b("Reason")}\u2003${reason}`,
          `${b("Moderator")}\u2003${message.author.tag}`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
