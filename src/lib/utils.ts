import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SHARE_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function generateShareId(length = 10): string {
  const arr = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(arr, b => SHARE_ID_CHARS[b % SHARE_ID_CHARS.length]).join('');
}
