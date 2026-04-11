import { decodeBase64, encodeBase64 } from 'hono/utils/encode';
import { HttpError } from './http';

const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 100000;

export const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;

export const randomToken = (size = 24) => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const importPasswordKey = async (password: string) =>
  crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);

const toBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=+$/g, '');
};
const fromBase64 = (value: string) => decodeBase64(value);

export const hashPassword = async (password: string, salt = randomToken(16), iterations = PBKDF2_ITERATIONS) => {
  const key = await importPasswordKey(password);
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations,
      hash: 'SHA-256',
    },
    key,
    256,
  );

  return {
    salt,
    iterations,
    hash: toBase64(derived),
  };
};

export const verifyPassword = async (password: string, salt: string, iterations: number, expectedHash: string) => {
  const computed = await hashPassword(password, salt, iterations);
  const left = fromBase64(computed.hash);
  const right = fromBase64(expectedHash);

  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
};

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const ensureEmail = (value: string, message = 'Informe um e-mail valido.') => {
  const normalized = normalizeEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new HttpError(400, message);
  }
  return normalized;
};

export const sanitizeTemplateHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');

export const requireStrongPassword = (value: string) => {
  if (value.length < 10) {
    throw new HttpError(400, 'A senha precisa ter pelo menos 10 caracteres.');
  }
};
