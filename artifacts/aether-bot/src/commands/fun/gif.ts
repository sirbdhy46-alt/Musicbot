import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { searchGif } from "../../services/giphy.ts";
import { GAP, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "gif",
  aliases: ["giphy"],
  description: "Search Giphy for a gif.",
  category: "fun",
  usage: "gif <query>",
  run: async ({ message, args }) => {
    const q = args.join(" ").trim();
    if (!q) {
      await message.reply("usage — `+gif <query>`");
      return;
    }
    const url = await searchGif(q);
    if (!url) {
      await message.reply(`${e("warning")} no gif found for "${q}".`);
      return;
    }
    const eb = baseEmbed()
      .setColor(Colors.primary)
      .setDescription([h1(`${e("sparkle")}\u2003${q}`), GAP].join("\n"))
      .setImage(url);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
