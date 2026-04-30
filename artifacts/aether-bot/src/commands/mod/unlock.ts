import { ChannelType, PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "unlock",
  description: "Unlock this channel so members can send messages again.",
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
    await message.channel.permissionOverwrites.edit(everyone, { SendMessages: null });
    const eb = baseEmbed()
      .setColor(Colors.success)
      .setDescription([h1(`${e("check")}\u2003Channel Unlocked`), GAP, "the room is open again."].join("\n"));
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
