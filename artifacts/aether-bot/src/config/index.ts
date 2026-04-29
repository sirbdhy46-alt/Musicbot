import process from "node:process";

const required = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
};

export const config = {
  token: required("DISCORD_BOT_TOKEN"),
  prefix: process.env.BOT_PREFIX ?? "+",
  ownerId: process.env.BOT_OWNER_ID ?? "",
  defaultVolume: Number(process.env.DEFAULT_VOLUME ?? 60),
  maxVolume: Number(process.env.MAX_VOLUME ?? 200),
  inviteUrl: process.env.BOT_INVITE_URL ?? "",
  supportUrl: process.env.BOT_SUPPORT_URL ?? "",
} as const;
