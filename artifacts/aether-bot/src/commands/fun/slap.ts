import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "slap",
  description: "Cathartic. Slap a friend. (or enemy.)",
  category: "fun",
  usage: "slap @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply("usage — `+slap @user`");
      return;
    }
    const gif = await vibeGif("slap", "anime slap");
    const eb = baseEmbed()
      .setColor(Colors.fire)
      .setDescription(
        [
          h1(`${e("fire")}\u2003Direct Hit`),
          GAP,
          `${b(message.author.username)} slapped ${b(target.username)} into next week.`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
