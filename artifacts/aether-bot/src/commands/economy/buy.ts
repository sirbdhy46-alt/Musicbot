import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { getAccount, grantItem, takeCoins } from "../../services/economy.ts";
import { findItem } from "../../services/shop.ts";
import { GAP, b, coin, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "buy",
  aliases: ["purchase"],
  description: "Buy an item from the Aether shop.",
  category: "economy",
  usage: "buy <item>",
  run: async ({ message, args }) => {
    const query = args.join(" ").trim();
    if (!query) {
      await message.reply("usage — `+buy <item>`");
      return;
    }
    const item = findItem(query);
    if (!item) {
      await message.reply(`${e("cross")} no item by that name. try \`+shop\`.`);
      return;
    }
    const acc = getAccount(message.author.id);
    if (acc.wallet < item.price) {
      await message.reply(
        `${e("cross")} short by ${(item.price - acc.wallet).toLocaleString("en-US")} coins.`,
      );
      return;
    }
    takeCoins(message.author.id, item.price);
    grantItem(message.author.id, item.id, 1);

    const eb = baseEmbed()
      .setColor(Colors.gold)
      .setDescription(
        [
          h1(`${e("sparkle")}\u2003Purchase Complete`),
          GAP,
          `${item.emoji}\u2003${b(item.name)}`,
          `${b("Spent")}\u2003${coin(item.price)}`,
          GAP,
          `*${item.desc}*`,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
