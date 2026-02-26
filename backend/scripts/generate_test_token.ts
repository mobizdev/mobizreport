import crypto from 'node:crypto';

/**
 * Script to generate test tokens for the Multi-Tenant Finance Report System
 */

const SECRET_KEY = 'MultiTenantFinanceReport2026Key!!'; // Must match .env
const USER = 'administrator';
const COMPANY = 'millegudang';

// Set expiration (e.g., 24 hours from now in epoch seconds)
const epochTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

const dataToSign = `${USER}:${epochTime}`;

// HMAC-SHA256 signature
const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(dataToSign)
    .digest('hex');

const tokenContent = `${USER}:${epochTime}:${signature}`;

// Base64URL encode
const base64UrlEncode = (str: string): string => {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const token = base64UrlEncode(tokenContent);

console.log('\n--- TEST AUTHENTICATION URL ---');
console.log(`http://localhost:3000/${COMPANY}/verify?token=${token}`);
console.log('-------------------------------\n');
