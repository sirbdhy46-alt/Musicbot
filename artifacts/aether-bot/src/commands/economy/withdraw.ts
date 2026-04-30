import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { getAccount, withdraw } from "../../services/economy.ts";
import { GAP, b, coin, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "withdraw",
  aliases: ["with", "wd"],
  description: "Pull coins from your bank back into your wallet.",
  category: "economy",
  usage: "withdraw <amount|all>",
  run: async ({ message, args }) => {
    const acc = getAccount(message.author.id);
    const raw = args[0]?.toLowerCase() ?? "";
    const amount = raw === "all" || raw === "max" ? acc.bank : Math.floor(Number(raw));
    if (!amount || amount <= 0) {
      await message.reply("usage — `+withdraw <amount|all>`");
      return;
    }
    const moved = withdraw(message.author.id, amount);
    const eb = baseEmbed()
      .setColor(Colors.secondary)
      .setDescription(
        [
          h1(`${e("check")}\u2003Withdraw`),
          GAP,
          `${b("Moved")}\u2003${coin(moved)} → wallet`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
