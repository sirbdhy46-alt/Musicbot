import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "pat",
  description: "Headpats — soft and reassuring.",
  category: "fun",
  usage: "pat @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply("usage — `+pat @user`");
      return;
    }
    const gif = await vibeGif("pat", "anime headpat");
    const eb = baseEmbed()
      .setColor(Colors.secondary)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003Soft Touch`),
          GAP,
          `${b(message.author.username)} patted ${b(target.username)} on the head.`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
