import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { work } from "../../services/economy.ts";
import { GAP, b, coin, h1, shortDur } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "work",
  aliases: ["grind", "shift"],
  description: "Pull a quick shift in the Aether after-hours economy.",
  category: "economy",
  run: async ({ message }) => {
    const result = work(message.author.id);
    if (!result.ok) {
      const wait = shortDur(result.nextAt - Date.now());
      const eb = baseEmbed()
        .setColor(Colors.warn)
        .setDescription(
          [
            h1(`${e("warning")}\u2003On Break`),
            GAP,
            `next shift in ${b(wait)}.`,
          ].join("\n"),
        );
      await message.reply({ embeds: [eb] });
      return;
    }

    const eb = baseEmbed()
      .setColor(Colors.fire)
      .setDescription(
        [
          h1(`${e("fire")}\u2003Shift Complete`),
          GAP,
          `you ${result.line} and earned ${coin(result.amount)}.`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
