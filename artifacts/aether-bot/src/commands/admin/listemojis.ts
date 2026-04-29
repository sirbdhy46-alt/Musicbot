import type { Command } from "../types.ts";
import { EmbedBuilder } from "discord.js";
import { Colors } from "../../config/colors.ts";
import { e, EMOJI_NAMES, getEmojiStore } from "../../config/emojis.ts";

const cmd: Command = {
  name: "listemojis",
  aliases: ["emojistatus"],
  description: "Show which emojis are wired up.",
  category: "admin",
  run: async ({ message }) => {
    const store = getEmojiStore();
    const lines = EMOJI_NAMES.map((n) => {
      const entry = store[n];
      const status = entry?.id ? `${e("check")}` : `${e("cross")}`;
      const tag = entry?.id ? e(n) : "—";
      return `${status} \`${n.padEnd(14)}\` ${tag}`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setColor(Colors.info)
      .setTitle(`${e("sparkle")} Emoji Status (${EMOJI_NAMES.filter((n) => store[n]?.id).length}/${EMOJI_NAMES.length})`)
      .setDescription(lines)
      .setFooter({ text: "Run +uploademojis to upload missing slots." });

    return message.reply({ embeds: [embed] });
  },
};

export default cmd;
