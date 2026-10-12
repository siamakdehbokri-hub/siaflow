/** Four-digit local PIN; never use a four-digit PIN as the SQLCipher key. */
export const PIN_LENGTH = 4;
export const PIN_REGEX = /^[0-9]{4}$/;
const ITERATIONS = 200_000;

export function validPin(pin: string): boolean {
  return PIN_REGEX.test(pin);
}

function toBase64(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
}
function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}
export function randomBase64(bytes = 32): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function derivePinHash(pin: string, salt: string): Promise<string> {
  if (!validPin(pin)) throw new Error('رمز باید دقیقاً چهار رقم باشد.');
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(salt) as BufferSource, iterations: ITERATIONS },
    key,
    256,
  );
  return toBase64(new Uint8Array(hash));
}

export async function pinMatches(pin: string, salt: string, expected: string): Promise<boolean> {
  if (!validPin(pin)) return false;
  const actual = fromBase64(await derivePinHash(pin, salt));
  const stored = fromBase64(expected);
  if (actual.length !== stored.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ stored[i];
  return difference === 0;
}
