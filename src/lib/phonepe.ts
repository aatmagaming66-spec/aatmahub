
import crypto from 'crypto';

/**
 * Generates the X-VERIFY header for PhonePe API calls.
 */
export function generatePhonePeHeader(payload: string, saltKey: string, saltIndex: string) {
  const stringToHash = payload + '/pg/v1/pay' + saltKey;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return `${sha256}###${saltIndex}`;
}

/**
 * Verifies the callback signature from PhonePe.
 */
export function verifyPhonePeCallback(payload: string, saltKey: string, saltIndex: string, xVerify: string) {
  const stringToHash = payload + saltKey;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const expectedHeader = `${sha256}###${saltIndex}`;
  return expectedHeader === xVerify;
}

export const PHONEPE_ENDPOINTS = {
  sandbox: 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay',
  production: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
};
