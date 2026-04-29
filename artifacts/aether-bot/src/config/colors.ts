export const Colors = {
  primary: 0xff2bd6,
  secondary: 0x00e5ff,
  success: 0x22ff88,
  warn: 0xffe600,
  danger: 0xff3b3b,
  info: 0x9b5cff,
  fire: 0xff5b1f,
  gold: 0xffb300,
  premium: 0xff2bd6,
  bg: 0x0e0e10,
  outline: 0x1a1a1f,
} as const;

export const Gradients = {
  hype: [Colors.primary, Colors.fire],
  chill: [Colors.secondary, Colors.info],
  premium: [Colors.gold, Colors.primary],
} as const;
