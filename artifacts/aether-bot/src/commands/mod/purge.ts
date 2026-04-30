import { ChannelType, PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "purge",
  aliases: ["clear", "clean"],
  description: "Bulk delete recent messages in this channel.",
  category: "mod",
  usage: "purge <1-100>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply(`${e("lock")} you need **Manage Messages**.`);
      return;
    }
    const n = Math.floor(Number(args[0] ?? 0));
    if (!n || n < 1 || n > 100) {
      await message.reply("usage — `+purge <1-100>`");
      return;
    }
    if (message.channel.type !== ChannelType.GuildText) {
      await message.reply(`${e("cross")} only works in guild text channels.`);
      return;
    }
    const deleted = await message.channel.bulkDelete(n + 1, true).catch(() => null);
    if (!deleted) {
      await message.reply(`${e("cross")} couldn't bulk-delete (messages older than 14 days?).`);
      return;
    }
    const eb = baseEmbed()
      .setColor(Colors.success)
      .setDescription(
        [
          h1(`${e("check")}\u2003Channel Cleared`),
          GAP,
          `${b("Removed")}\u2003\`${deleted.size}\` messages`,
        ].join("\n"),
      );
    const reply = await message.channel.send({ embeds: [eb] });
    setTimeout(() => reply.delete().catch(() => null), 4000);
  },
};

export default cmd;
