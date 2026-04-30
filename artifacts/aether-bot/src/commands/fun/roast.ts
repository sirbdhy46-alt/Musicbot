import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const ROASTS = [
  "your aesthetic peaked in a 2014 Tumblr re-blog.",
  "your taste in music is the playlist they leave on at the dentist.",
  "you're the human equivalent of unflavored protein powder.",
  "your vibe is 'wifi password is wifi password.'",
  "you type \"k.\" and think it's a personality.",
  "you're the reason the loading bar gets stuck at 99%.",
  "your DM history is a graveyard of typos.",
  "even autocorrect gives up halfway through your name.",
];

const cmd: Command = {
  name: "roast",
  description: "A measured, surgical roast.",
  category: "fun",
  usage: "roast @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first() ?? message.author;
    const line = ROASTS[Math.floor(Math.random() * ROASTS.length)] ?? ROASTS[0]!;
    const eb = baseEmbed()
      .setColor(Colors.fire)
      .setDescription(
        [
          h1(`${e("fire")}\u2003Roasted`),
          GAP,
          `${b(target.username)},\u2003${line}`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
