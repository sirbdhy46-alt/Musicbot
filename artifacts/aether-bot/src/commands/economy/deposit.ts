import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { deposit, getAccount } from "../../services/economy.ts";
import { GAP, b, coin, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "deposit",
  aliases: ["dep"],
  description: "Move coins from your wallet into your bank.",
  category: "economy",
  usage: "deposit <amount|all>",
  run: async ({ message, args }) => {
    const acc = getAccount(message.author.id);
    const raw = args[0]?.toLowerCase() ?? "";
    const amount = raw === "all" || raw === "max" ? acc.wallet : Math.floor(Number(raw));
    if (!amount || amount <= 0) {
      await message.reply("usage — `+deposit <amount|all>`");
      return;
    }
    const moved = deposit(message.author.id, amount);
    const eb = baseEmbed()
      .setColor(Colors.secondary)
      .setDescription(
        [
          h1(`${e("check")}\u2003Deposit`),
          GAP,
          `${b("Moved")}\u2003${coin(moved)} → bank`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
