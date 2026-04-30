import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const LINES = [
  "your energy makes the chat brighter.",
  "you have main-character lighting in every photo.",
  "your taste is dangerous. show me a playlist.",
  "you'd survive any plot twist.",
  "you're the reason the late-shift is fun.",
  "you make even silence feel produced.",
  "you'd absolutely sell out the first show.",
  "your typos still slap.",
];

const cmd: Command = {
  name: "compliment",
  aliases: ["nice", "love"],
  description: "Hand someone a real compliment, no notes.",
  category: "fun",
  usage: "compliment @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first() ?? message.author;
    const line = LINES[Math.floor(Math.random() * LINES.length)] ?? LINES[0]!;
    const eb = baseEmbed()
      .setColor(Colors.primary)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003Compliment`),
          GAP,
          `${b(target.username)},\u2003${line}`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
