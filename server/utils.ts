/**
 * Shared utility functions for the server
 */

/**
 * Create a hash of data for anchoring
 */
export function createDataHash(data: any): string {
  const crypto = require('crypto');
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
