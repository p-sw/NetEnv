import { createHash } from 'node:crypto';

/**
 * Encrypt string with sha256
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function sha256(text) {
  return createHash('sha256').update(text).digest('base64');
}
