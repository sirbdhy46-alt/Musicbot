import { ChannelType, type Client, EmbedBuilder } from "discord.js";
import { Colors } from "../config/colors.ts";
import { e } from "../config/emojis.ts";
import { vibeGif } from "../services/giphy.ts";
import { getSettings } from "../services/settings.ts";
import { GAP, b, h1 } from "../utils/aesthetic.ts";

function render(template: string, ctx: { user: string; guild: string; count: number }): string {
  return template
    .replaceAll("{user}", ctx.user)
    .replaceAll("{guild}", ctx.guild)
    .replaceAll("{count}", String(ctx.count));
}

export function registerWelcome(client: Client): void {
  client.on("guildMemberAdd", async (member) => {
    const s = getSettings(member.guild.id);
    if (!s.welcome_chan) return;
    const channel = member.guild.channels.cache.get(s.welcome_chan);
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const tmpl = s.welcome_msg ?? "welcome to {guild}, {user} — you're member #{count}.";
    const msg = render(tmpl, {
      user: `<@${member.id}>`,
      guild: member.guild.name,
      count: member.guild.memberCount,
    });
    const gif = await vibeGif("welcome", "anime welcome neon");
    const eb = new EmbedBuilder()
      .setColor(Colors.primary)
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(
        [h1(`${e("sparkle")}\u2003New Arrival`), GAP, msg, GAP, `${b("Joined")}\u2003<t:${Math.floor(Date.now() / 1000)}:R>`].join("\n"),
      )
      .setFooter({ text: "Aether • dark, loud, in your veins" })
      .setTimestamp();
    if (gif) eb.setImage(gif);
    await channel.send({ embeds: [eb] }).catch(() => null);
  });

  client.on("guildMemberRemove", async (member) => {
    const s = getSettings(member.guild.id);
    if (!s.welcome_chan) return;
    const channel = member.guild.channels.cache.get(s.welcome_chan);
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const gif = await vibeGif("goodbye", "anime sad goodbye");
    const eb = new EmbedBuilder()
      .setColor(Colors.info)
      .setDescription(
        [
          h1(`${e("warning")}\u2003Out The Door`),
          GAP,
          `${b(member.user?.tag ?? "someone")} left ${member.guild.name}.`,
        ].join("\n"),
      )
      .setFooter({ text: "Aether • dark, loud, in your veins" })
      .setTimestamp();
    if (gif) eb.setImage(gif);
    await channel.send({ embeds: [eb] }).catch(() => null);
  });
}
