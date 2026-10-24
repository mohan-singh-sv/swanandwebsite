import CryptoJS from 'crypto-js';
import { env } from '../config';

export function signRequest() {
  const timestamp = String(Date.now());
  const key = env.licenseKey.trim();
  const secret = env.websiteApiSecret.trim();
  const digest = CryptoJS.HmacSHA256(`${key}.${timestamp}`, secret).toString(CryptoJS.enc.Hex);
  return {
    headers: {
      'x-license-key': key,
      'x-api-timestamp': timestamp,
      'x-api-secret': digest,
    } as Record<string, string>,
  };
}
