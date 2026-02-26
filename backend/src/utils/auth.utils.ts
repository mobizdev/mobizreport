import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET, EXTERNAL_AUTH_SECRET } from '../config/db.config';

/**
 * Decodes a Base64URL encoded string.
 */
const base64UrlDecode = (str: string): string => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    return Buffer.from(base64 + padding, 'base64').toString();
};

/**
 * Verifies the external token format: Base64Url(user:epochtime:signature)
 * signature = HMAC-SHA256(user:epochtime, secretkey)
 */
export const verifyExternalToken = (token: string): { user: string; expired: boolean } | null => {
    try {
        const decoded = base64UrlDecode(token);
        const parts = decoded.split(':');

        if (parts.length < 3) return null;

        const user = parts[0];
        const epochTime = parseInt(parts[1], 10);
        const signature = parts[2];

        // 1. Re-calculate signature to verify
        const dataToSign = `${user}:${epochTime}`;
        const expectedSignature = crypto
            .createHmac('sha256', EXTERNAL_AUTH_SECRET)
            .update(dataToSign)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid token signature');
            return null;
        }

        // 2. Check expiration (epochTime is the expiration time)
        const now = Math.floor(Date.now() / 1000);
        if (now > epochTime) {
            console.warn(`Token expired: ${now} > ${epochTime}`);
            return { user, expired: true };
        }

        return { user, expired: false };
    } catch (error) {
        console.error('Error verifying external token:', error);
        return null;
    }
};

export const generateJWT = (user: string, companyCode: string) => {
    return jwt.sign({ user, companyCode }, JWT_SECRET, { expiresIn: '8h' });
};
