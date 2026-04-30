import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const ANSWERS = [
  "without a doubt.",
  "the void says yes.",
  "signs point to yes.",
  "definitely.",
  "looks promising.",
  "it's hazy — try again.",
  "ask again later.",
  "do not count on it.",
  "the static disagrees.",
  "outlook: bleak.",
  "absolutely not.",
];

const cmd: Command = {
  name: "8ball",
  aliases: ["eightball", "ask"],
  description: "Ask the static a question. The static answers.",
  category: "fun",
  usage: "8ball <question>",
  run: async ({ message, args }) => {
    const q = args.join(" ").trim();
    if (!q) {
      await message.reply("usage — `+8ball <question>`");
      return;
    }
    const a = ANSWERS[Math.floor(Math.random() * ANSWERS.length)] ?? ANSWERS[0]!;
    const eb = baseEmbed()
      .setColor(Colors.info)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003The Static Answers`),
          GAP,
          `${b("Q")}\u2003${q}`,
          `${b("A")}\u2003${a}`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
