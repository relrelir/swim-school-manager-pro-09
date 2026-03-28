/** Israeli ID validation (Luhn-based checksum) */
export function validateIsraeliId(raw: string): boolean {
  const id = raw.replace(/\D/g, '').padStart(9, '0');
  if (id.length !== 9) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = parseInt(id[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
}

/** Israeli phone validation: mobile (05X) or landline (0X) — 10 digits */
export function validateIsraeliPhone(raw: string): boolean {
  const phone = raw.replace(/[\s\-]/g, '');
  return /^(05\d|0[2-4789])\d{7}$/.test(phone);
}

/** Basic email format validation */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
