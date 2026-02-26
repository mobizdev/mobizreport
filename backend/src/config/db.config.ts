import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseServer = (serverStr: string) => {
    const parts = serverStr.split('\\');
    return {
        server: parts[0],
        instanceName: parts[1] || undefined
    };
};

const serverInfo = parseServer(process.env.DB_SERVER || 'localhost');

export const globalConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'password',
    server: serverInfo.server,
    database: process.env.DB_GLOBAL_MASTER || 'M1System',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: serverInfo.instanceName,
    },
    pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

export const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
export const EXTERNAL_AUTH_SECRET = process.env.EXTERNAL_AUTH_SECRET || 'external-secret';
