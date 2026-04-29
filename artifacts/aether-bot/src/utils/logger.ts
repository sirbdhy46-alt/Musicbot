const ts = (): string => new Date().toISOString();

const fmt = (level: string, color: string, msg: string): string =>
  `\x1b[90m${ts()}\x1b[0m ${color}${level}\x1b[0m ${msg}`;

export const logger = {
  info: (msg: string): void =>
    console.log(fmt("INFO ", "\x1b[36m", msg)),
  warn: (msg: string): void =>
    console.warn(fmt("WARN ", "\x1b[33m", msg)),
  error: (msg: string, err?: unknown): void => {
    console.error(fmt("ERROR", "\x1b[31m", msg));
    if (err) console.error(err);
  },
  ready: (msg: string): void =>
    console.log(fmt("READY", "\x1b[35m", msg)),
  music: (msg: string): void =>
    console.log(fmt("MUSIC", "\x1b[95m", msg)),
};
