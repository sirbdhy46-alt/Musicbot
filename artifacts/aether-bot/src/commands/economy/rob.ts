import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { tryRob } from "../../services/economy.ts";
import { GAP, b, coin, h1, shortDur } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "rob",
  aliases: ["steal", "heist"],
  description: "Risky business — try to lift coins from another user's wallet.",
  category: "economy",
  usage: "rob @user",
  run: async ({ message }) => {
    const target = message.mentions.users.first();
    if (!target || target.bot || target.id === message.author.id) {
      await message.reply("usage — `+rob @user`");
      return;
    }
    const r = tryRob(message.author.id, target.id);
    if (r.ok) {
      const eb = baseEmbed()
        .setColor(Colors.fire)
        .setDescription(
          [
            h1(`${e("fire")}\u2003Heist Successful`),
            GAP,
            `${b(message.author.username)} got ${coin(r.amount)} off ${b(target.username)}.`,
          ].join("\n"),
        );
      await message.reply({ embeds: [eb] });
      return;
    }
    const detail = r.nextAt
      ? `try again in ${b(shortDur(r.nextAt - Date.now()))}.`
      : r.reason;
    const eb = baseEmbed()
      .setColor(Colors.danger)
      .setDescription(
        [
          h1(`${e("cross")}\u2003Heist Failed`),
          GAP,
          detail,
        ].join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
