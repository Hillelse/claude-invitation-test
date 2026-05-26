export function normalizePhone(raw: string): string {
  const p = raw.replace(/[\s\-\.\(\)\/]/g, '');
  if (p.startsWith('+33'))   return '0' + p.slice(3);
  if (p.startsWith('0033'))  return '0' + p.slice(4);
  if (p.startsWith('+972'))  return '0' + p.slice(4);
  if (p.startsWith('00972')) return '0' + p.slice(5);
  return p;
}

export function isValidPhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return /^\+?[0-9]{7,15}$/.test(digits);
}
