import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "hug",
  description: "Send a warm hug across the void.",
  category: "fun",
  usage: "hug @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply("usage — `+hug @user`");
      return;
    }
    const gif = await vibeGif("hug", "anime hug warm");
    const eb = baseEmbed()
      .setColor(Colors.primary)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003Soft Static`),
          GAP,
          `${b(message.author.username)} pulled ${b(target.username)} into a long, slow hug.`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
