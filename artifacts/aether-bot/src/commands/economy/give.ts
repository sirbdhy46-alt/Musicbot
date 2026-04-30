import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { addCoins, takeCoins } from "../../services/economy.ts";
import { GAP, b, coin, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "give",
  aliases: ["pay", "send"],
  description: "Send coins from your wallet to someone else.",
  category: "economy",
  usage: "give @user <amount>",
  run: async ({ message, args }) => {
    const target = message.mentions.users.first();
    const amount = Number(args.find((a) => /^\d+$/.test(a)));
    if (!target || !amount || amount <= 0) {
      await message.reply("usage — `+give @user <amount>`");
      return;
    }
    if (target.id === message.author.id || target.bot) {
      await message.reply("can't pay that user.");
      return;
    }
    if (!takeCoins(message.author.id, amount)) {
      await message.reply(`${e("cross")} not enough in your wallet.`);
      return;
    }
    addCoins(target.id, amount);

    const eb = baseEmbed()
      .setColor(Colors.success)
      .setDescription(
        [
          h1(`${e("check")}\u2003Transfer Cleared`),
          GAP,
          `${b(message.author.username)}\u2003→\u2003${b(target.username)}`,
          `${b("Amount")}\u2003${coin(amount)}`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
