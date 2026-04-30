import { PermissionFlagsBits } from "discord.js";
import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { vibeGif } from "../../services/giphy.ts";
import { GAP, b, h1, shortDur } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

function parseDuration(input: string): number {
  const m = /^(\d+)([smhd])$/i.exec(input.trim());
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = (m[2] ?? "m").toLowerCase();
  const mult = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}

const cmd: Command = {
  name: "mute",
  aliases: ["timeout", "silence"],
  description: "Timeout a user for a duration.",
  category: "mod",
  usage: "mute @user <10m|1h|1d> [reason]",
  run: async ({ message, args }) => {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await message.reply(`${e("lock")} you need **Moderate Members**.`);
      return;
    }
    const target = message.mentions.members?.first();
    if (!target) {
      await message.reply("usage — `+mute @user <10m|1h|1d> [reason]`");
      return;
    }
    const durArg = args.find((a) => /^\d+[smhd]$/i.test(a));
    const ms = durArg ? parseDuration(durArg) : 10 * 60_000;
    if (ms <= 0 || ms > 28 * 86_400_000) {
      await message.reply(`${e("cross")} duration must be between 1s and 28d.`);
      return;
    }
    const reason = args.filter((a) => !a.startsWith("<@") && !/^\d+[smhd]$/i.test(a)).join(" ") || "no reason given";
    try {
      await target.timeout(ms, `${message.author.tag}: ${reason}`);
    } catch {
      await message.reply(`${e("cross")} I can't timeout that user.`);
      return;
    }
    const gif = await vibeGif("mute", "anime quiet shush");
    const eb = baseEmbed()
      .setColor(Colors.info)
      .setDescription(
        [
          h1(`${e("lock")}\u2003User Silenced`),
          GAP,
          `${b("User")}\u2003${target.user.tag}`,
          `${b("Duration")}\u2003${shortDur(ms)}`,
          `${b("Reason")}\u2003${reason}`,
        ].join("\n"),
      );
    if (gif) eb.setImage(gif);
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
