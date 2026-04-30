// Aether aesthetic primitives used across embeds.
// Style rules:
// - Markdown headings (`#`, `##`, `###`) for titles, NOT spaced-out letters.
// - Em-space (\u2003) for breathable inline padding.
// - Zero-width space + newlines for vertical "GAP" between sections.
// - Title Case for headings, lowercase prose underneath when it fits the mood.
export const EM = "\u2003";
export const GAP = "\n\u200b\n";

export const dot = ` ${EM}•${EM} `;
export const arrow = ` ${EM}→${EM} `;

export function h1(text: string): string {
  return `# ${text}`;
}
export function h2(text: string): string {
  return `## ${text}`;
}
export function h3(text: string): string {
  return `### ${text}`;
}

export function b(text: string): string {
  return `**${text}**`;
}

export function field(label: string, value: string): string {
  return `${b(label)}${EM}${value}`;
}

export function pad(text: string, width = 12): string {
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

export function shortDur(ms: number): string {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function coin(n: number): string {
  return `\`${n.toLocaleString("en-US")}\` coins`;
}

export const titleCase = (s: string): string =>
  s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
