import { ChannelType, PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "slowmode",
  aliases: ["slow"],
  description: "Set slowmode for this channel in seconds (0 = off, max 21600).",
  category: "mod",
  usage: "slowmode <0-21600>",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await message.reply(`${e("lock")} you need **Manage Channels**.`);
      return;
    }
    if (message.channel.type !== ChannelType.GuildText) {
      await message.reply(`${e("cross")} only works in text channels.`);
      return;
    }
    const seconds = Math.max(0, Math.min(21600, Math.floor(Number(args[0] ?? 0))));
    await message.channel.setRateLimitPerUser(seconds);
    const eb = baseEmbed()
      .setColor(Colors.info)
      .setDescription(
        [
          h1(`${e("warning")}\u2003Slowmode Set`),
          GAP,
          `${b("Cooldown")}\u2003\`${seconds}s\``,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
