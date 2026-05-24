export function isValidPhone(raw: string): boolean {
  // Strip common formatting chars, then check for 7–15 digits (ITU-T E.164 max is 15)
  const digits = raw.replace(/[\s\-\.\(\)\/]/g, '');
  return /^\+?[0-9]{7,15}$/.test(digits);
}
