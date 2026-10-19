/** POSIX single-quote escaping. Safe tokens are left bare for readability. */
export function shellQuote(value: string): string {
  if (value === "") return "''";
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export const patterns = {
  gitUrl: /^(https:\/\/|ssh:\/\/|git@)[^\s'"`$;&|<>\\]+$/,
  ref: /^(?!-)[A-Za-z0-9._/-]+$/,
  host: /^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/,
  user: /^[A-Za-z_][A-Za-z0-9_-]*$/,
  pkg: /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
  dirName: /^[A-Za-z0-9._-][A-Za-z0-9._/-]*$/,
  image: /^[a-z0-9]+([._/:@-][a-zA-Z0-9]+)*$/,
  portMap: /^(\d{1,5}:)?\d{1,5}(\/(tcp|udp))?$|^127\.0\.0\.1:\d{1,5}:\d{1,5}$/,
  envPair: /^[A-Za-z_][A-Za-z0-9_]*=[^\n\r]*$/,
};

/** Rejects paths that start with "-" (option injection) or contain control characters. */
export function safePath(p: string): boolean {
  return p.length > 0 && p.length < 500 && !p.startsWith("-") && !/[\u0000-\u001F]/.test(p);
}
