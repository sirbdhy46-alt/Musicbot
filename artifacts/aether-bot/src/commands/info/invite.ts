import type { Command } from "../types.ts";
import { EmbedBuilder, OAuth2Scopes } from "discord.js";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { PERMS } from "../../events/ready.ts";

const cmd: Command = {
  name: "invite",
  aliases: ["inv"],
  description: "Get the bot invite link.",
  category: "info",
  run: async ({ message }) => {
    const url = message.client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: PERMS,
    });
    const embed = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle(`${e("aether_logo")} Invite Aether to your server`)
      .setDescription(`[**Click here to add Aether**](${url})\n\nDark, loud, premium-grade vibes.`)
      .setFooter({ text: "Aether • dark, loud, in your veins" });
    return message.reply({ embeds: [embed] });
  },
};

export default cmd;
