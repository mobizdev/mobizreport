import mssql from 'mssql';
import NodeCache from 'node-cache';
import { globalConfig } from '../config/db.config';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const poolCache = new Map<string, mssql.ConnectionPool>();

/**
 * Gets the global master pool
 */
export const getGlobalPool = async () => {
    let pool = poolCache.get('global');
    if (!pool || !pool.connected) {
        pool = await new mssql.ConnectionPool(globalConfig).connect();
        poolCache.set('global', pool);
    }
    return pool;
};

/**
 * 1. Identifikasi Tenant: Find System DB info in TenantSystem
 */
export const getSystemDbInfo = async (companyCode: string) => {
    const cacheKey = `system_info_${companyCode}`;
    let info = cache.get<any>(cacheKey);
    
    if (!info) {
        const pool = await getGlobalPool();
        const result = await pool.request()
            .input('CompanyCode', mssql.NVarChar, companyCode)
            .query('SELECT DbServer, DbName, DbUser, DbPassword FROM TenantSystem WHERE CompanyCode = @CompanyCode AND IsActive = 1');
        
        if (result.recordset.length === 0) return null;
        info = result.recordset[0];
        cache.set(cacheKey, info);
    }
    return info;
};

/**
 * 2. Koneksi ke System DB (MILLE_BARU_M1System)
 */
export const getSystemPool = async (companyCode: string) => {
    const poolKey = `system_pool_${companyCode}`;
    let pool = poolCache.get(poolKey);

    if (!pool || !pool.connected) {
        const info = await getSystemDbInfo(companyCode);
        if (!info) throw new Error(`Tenant System DB not found for: ${companyCode}`);

        const serverParts = info.DbServer.split('\\');
        const config: mssql.config = {
            user: info.DbUser,
            password: info.DbPassword,
            server: serverParts[0],
            database: info.DbName,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                instanceName: serverParts[1] || undefined,
            }
        };

        pool = await new mssql.ConnectionPool(config).connect();
        poolCache.set(poolKey, pool);
    }
    return pool;
};

/**
 * 3. Validasi Perusahaan & Ambil Accounting ConnectionString
 */
export const getAccountingConfig = async (companyCode: string, companyId: string) => {
    const cacheKey = `accounting_config_${companyCode}_${companyId}`;
    let config = cache.get<any>(cacheKey);

    if (!config) {
        const systemPool = await getSystemPool(companyCode);
        const result = await systemPool.request()
            .input('CompanyId', mssql.NVarChar, companyId)
            .query('SELECT ConnectionString FROM M1F_Companies WHERE CompanyId = @CompanyId');

        if (result.recordset.length === 0) return null;
        config = result.recordset[0];
        cache.set(cacheKey, config);
    }
    return config;
};

/**
 * 4. Akses Data Akunting (MILLE_BARU_M1Company)
 * Uses the ConnectionString from M1F_Companies
 */
export const getAccountingPool = async (companyCode: string, companyId: string) => {
    const poolKey = `accounting_pool_${companyCode}_${companyId}`;
    let pool = poolCache.get(poolKey);

    if (!pool || !pool.connected) {
        const config = await getAccountingConfig(companyCode, companyId);
        if (!config || !config.ConnectionString) {
            throw new Error(`Accounting ConnectionString not found for CompanyId: ${companyId}`);
        }

        // Add trust parameters directly to the connection string
        // This is a reliable way to ensure the mssql driver trusts the certificate
        let connStr = config.ConnectionString;
        if (!connStr.toLowerCase().includes('trustservercertificate')) {
            connStr += (connStr.includes(';') ? '' : ';') + 'trustServerCertificate=true;';
        }
        if (!connStr.toLowerCase().includes('encrypt')) {
            connStr += 'encrypt=false;';
        }

        pool = await new mssql.ConnectionPool(connStr).connect();
        poolCache.set(poolKey, pool);
    }
    return pool;
};

/**
 * Check Permission for a report (FormId)
 */
export const checkPermission = async (companyCode: string, user: string, formId: number) => {
    if (user.toLowerCase() === 'administrator') return true;

    const systemPool = await getSystemPool(companyCode);
    const result = await systemPool.request()
        .input('FormId', mssql.Int, formId)
        .input('User', mssql.NVarChar, user)
        .query(`
            SELECT p.PermissionName 
            FROM [M1F_ModuleRegisteredPermission] m
            JOIN [M1F_PermissionType] p ON m.PermissionTypeId = p.PermissionTypeId
            WHERE m.FormId = @FormId AND p.PermissionName = 'Read'
        `);
    
    return result.recordset.length > 0;
};
