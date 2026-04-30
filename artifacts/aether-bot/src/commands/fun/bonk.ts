import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "bonk",
  description: "Send a friend to horny jail.",
  category: "fun",
  usage: "bonk @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply("usage — `+bonk @user`");
      return;
    }
    const gif = await vibeGif("bonk", "anime bonk");
    const eb = baseEmbed()
      .setColor(Colors.warn)
      .setDescription(
        [
          h1(`${e("warning")}\u2003Bonk`),
          GAP,
          `${b(message.author.username)} bonked ${b(target.username)} straight to horny jail.`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
