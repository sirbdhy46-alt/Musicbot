import { baseEmbed } from "../../embeds/builder.ts";
import { Colors } from "../../config/colors.ts";
import { e } from "../../config/emojis.ts";
import { GAP, b, h1 } from "../../utils/aesthetic.ts";
import type { Command } from "../types.ts";

const cmd: Command = {
  name: "userinfo",
  aliases: ["whois", "ui"],
  description: "Look up a user's profile.",
  category: "util",
  usage: "userinfo [@user]",
  run: async ({ message }) => {
    const target = message.mentions.members?.first() ?? message.member!;
    const user = target.user;
    const created = Math.floor(user.createdTimestamp / 1000);
    const joined = target.joinedTimestamp ? Math.floor(target.joinedTimestamp / 1000) : null;
    const roles = target.roles.cache
      .filter((r) => r.id !== message.guild!.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => r.toString())
      .slice(0, 12)
      .join(" · ") || "_none_";

    const eb = baseEmbed()
      .setColor(target.displayHexColor === "#000000" ? Colors.info : Number.parseInt(target.displayHexColor.slice(1), 16))
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .setDescription(
        [
          h1(`${e("crown")}\u2003${user.username}`),
          GAP,
          `${b("Tag")}\u2003${user.tag}`,
          `${b("ID")}\u2003\`${user.id}\``,
          `${b("Created")}\u2003<t:${created}:R>`,
          joined ? `${b("Joined")}\u2003<t:${joined}:R>` : "",
          GAP,
          `${b("Roles")}\u2003${roles}`,
        ].filter(Boolean).join("\n"),
      );
    await message.reply({ embeds: [eb] });
  },
};

export default cmd;
