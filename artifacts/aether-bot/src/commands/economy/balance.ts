import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { getAccount } from "../../services/economy.ts";
import { GAP, b, coin, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "balance",
  aliases: ["bal", "wallet", "money"],
  description: "Check your wallet, your bank, and your standing.",
  category: "economy",
  usage: "balance [@user]",
  run: async ({ message, args }) => {
    const target =
      message.mentions.users.first() ??
      (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null) ??
      message.author;

    const acc = getAccount(target.id);
    const total = acc.wallet + acc.bank;

    const eb = baseEmbed()
      .setColor(Colors.gold)
      .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL() })
      .setDescription(
        [
          h1(`${e("crown")}${"\u2003"}${target.username}'s Coffers`),
          GAP,
          `${b("Wallet")}\u2003${coin(acc.wallet)}`,
          `${b("Bank")}\u2003${coin(acc.bank)}\u2003·\u2003cap ${acc.bank_cap.toLocaleString("en-US")}`,
          `${b("Net Worth")}\u2003${coin(total)}`,
          GAP,
          `${b("Daily Streak")}\u2003\`${acc.streak}\` days`,
        ].join("\n"),
      );

    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
