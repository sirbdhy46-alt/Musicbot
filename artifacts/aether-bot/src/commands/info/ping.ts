import type { Command } from "../types.ts";
import { EmbedBuilder } from "discord.js";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";

const cmd: Command = {
  name: "ping",
  description: "Check the bot's latency.",
  category: "info",
  run: async ({ message }) => {
    const sent = await message.reply("…");
    const roundTrip = sent.createdTimestamp - message.createdTimestamp;
    const ws = Math.round(message.client.ws.ping);
    const embed = new EmbedBuilder()
      .setColor(Colors.success)
      .setTitle(`${e("sparkle")} Pong`)
      .addFields(
        { name: "Round Trip", value: `\`${roundTrip}ms\``, inline: true },
        { name: "WebSocket", value: `\`${ws}ms\``, inline: true },
      );
    return sent.edit({ content: null, embeds: [embed] });
  },
};

export default cmd;
