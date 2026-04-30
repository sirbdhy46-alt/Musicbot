import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { claimDaily } from "../../services/economy.ts";
import { GAP, b, coin, h1, shortDur } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "daily",
  description: "Claim your daily coin drop. Streaks pay extra.",
  category: "economy",
  run: async ({ message }) => {
    const result = claimDaily(message.author.id);
    if (!result.ok) {
      const wait = shortDur(result.nextAt - Date.now());
      const eb = baseEmbed()
        .setColor(Colors.warn)
        .setDescription(
          [
            h1(`${e("warning")}\u2003Already Collected`),
            GAP,
            `come back in ${b(wait)}.`,
          ].join("\n"),
        );
      await message.reply({ embeds: [eb] });
      return;
    }

    const eb = baseEmbed()
      .setColor(Colors.gold)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003Daily Drop`),
          GAP,
          `you pocketed ${coin(result.amount)}.`,
          `${b("Streak")}\u2003\`${result.streak}\` days`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
