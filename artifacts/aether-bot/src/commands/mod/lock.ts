import { ChannelType, PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "lock",
  aliases: ["lockdown"],
  description: "Lock this channel so @everyone can't send messages.",
  category: "mod",
  run: async ({ message }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await message.reply(`${e("lock")} you need **Manage Channels**.`);
      return;
    }
    if (message.channel.type !== ChannelType.GuildText) {
      await message.reply(`${e("cross")} only works in text channels.`);
      return;
    }
    const everyone = message.guild!.roles.everyone;
    await message.channel.permissionOverwrites.edit(everyone, { SendMessages: false });
    const eb = baseEmbed()
      .setColor(Colors.danger)
      .setDescription([h1(`${e("lock")}\u2003Channel Locked`), GAP, "@everyone can't speak here."].join("\n"));
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
