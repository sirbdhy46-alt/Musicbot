import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "kiss",
  description: "Plant one. Soft, neon, on screen.",
  category: "fun",
  usage: "kiss @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply("usage — `+kiss @user`");
      return;
    }
    const gif = await vibeGif("kiss", "anime kiss soft");
    const eb = baseEmbed()
      .setColor(Colors.primary)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003Closer`),
          GAP,
          `${b(message.author.username)} kissed ${b(target.username)}.`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
