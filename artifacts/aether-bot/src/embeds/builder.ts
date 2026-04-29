import { EmbedBuilder } from "discord.js";
import { Colors } from "../config/colors.ts";
import { e } from "../config/emojis.ts";

const FOOTER = "Aether • dark, loud, in your veins";

export const baseEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setColor(Colors.primary)
    .setFooter({ text: FOOTER })
    .setTimestamp();

export const successEmbed = (text: string, title?: string): EmbedBuilder => {
  const eb = baseEmbed().setColor(Colors.success).setDescription(`${e("check")} ${text}`);
  if (title) eb.setTitle(title);
  return eb;
};

export const errorEmbed = (text: string, title?: string): EmbedBuilder => {
  const eb = baseEmbed().setColor(Colors.danger).setDescription(`${e("cross")} ${text}`);
  if (title) eb.setTitle(title);
  return eb;
};

export const warnEmbed = (text: string, title?: string): EmbedBuilder => {
  const eb = baseEmbed().setColor(Colors.warn).setDescription(`${e("warning")} ${text}`);
  if (title) eb.setTitle(title);
  return eb;
};

export const infoEmbed = (text: string, title?: string): EmbedBuilder => {
  const eb = baseEmbed().setColor(Colors.info).setDescription(text);
  if (title) eb.setTitle(title);
  return eb;
};

export const hypeEmbed = (text: string, title?: string): EmbedBuilder => {
  const eb = baseEmbed().setColor(Colors.fire).setDescription(`${e("fire")} ${text}`);
  if (title) eb.setTitle(title);
  return eb;
};
