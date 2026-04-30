import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "ban",
  description: "Ban a user from the server. Sends them out with style.",
  category: "mod",
  usage: "ban @user [reason]",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
      await message.reply(`${e("lock")} you need **Ban Members**.`);
      return;
    }
    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply("usage — `+ban @user [reason]`");
      return;
    }
    if (!target.bannable) {
      await message.reply(`${e("cross")} I can't ban that user.`);
      return;
    }
    const reason = args.slice(1).join(" ") || "no reason given";
    try {
      await target.ban({ reason: `${message.author.tag}: ${reason}` });
    } catch {
      await message.reply(`${e("cross")} ban failed.`);
      return;
    }

    const gif = await vibeGif("ban", "anime ban hammer");
    const eb = baseEmbed()
      .setColor(Colors.danger)
      .setDescription(
        [
          h1(`${e("fire")}\u2003User Banished`),
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
