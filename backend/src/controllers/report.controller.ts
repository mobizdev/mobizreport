import { Request, Response } from 'express';
import mssql from 'mssql';
import { checkPermission } from '../services/tenant.service';

export const getBukuBesarSummary = async (req: Request, res: Response) => {
    try {
        const { companyCode, user } = req.user;
        const formId = 3128; // Example FormId for Buku Besar

        // 4. Cek Izin Laporan (FormId)
        const hasPermission = await checkPermission(companyCode, user, formId);
        if (!hasPermission) {
            return res.status(403).json({ error: 'You do not have permission to view this report.' });
        }

        const pool = req.db as mssql.ConnectionPool;
        
        // 5. Akses Data Akunting
        // Pool ini sudah otomatis mengarah ke database perusahaan yang benar berdasarkan ConnectionString
        const result = await pool.request()
            .query('SELECT TOP 10 * FROM GL_Transactions'); 

        res.json(result.recordset);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch report: ' + err.message });
    }
};

export const getLedgerList = async (req: Request, res: Response) => {
    try {
        const { companyCode, user } = req.user;
        const { startDate, endDate, startAccountCode, endAccountCode } = req.query;
        const formId = 41001; // AccountingLedger

        // 4. Cek Izin Laporan (FormId)
        const hasPermission = await checkPermission(companyCode, user, formId);
        if (!hasPermission) {
            return res.status(403).json({ error: 'You do not have permission to view this report.' });
        }

        const pool = req.db as mssql.ConnectionPool;
        
        const result = await pool.request()
            .input('startDate', mssql.DateTime, startDate)
            .input('endDate', mssql.DateTime, endDate)
            .input('startAccountCode', mssql.VarChar, startAccountCode)
            .input('endAccountCode', mssql.VarChar, endAccountCode)
            .execute('Finance.GetLedgerList');

        res.json(result.recordset);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Failed to execute GetLedgerList: ' + err.message });
    }
};

export const getChartOfAccounts = async (req: Request, res: Response) => {
    try {
        const pool = req.db as mssql.ConnectionPool;
        const result = await pool.request()
            .query(`
                SELECT coa.AccountCode, coa.Name, coa.CurrencyId, coa.CategoryId, 
                CASE 
                    WHEN coa.Type = 0 THEN 'Balance Sheet' 
                    WHEN coa.Type = 1 THEN 'Profit and Loss' 
                    ELSE 'Cosignment' 
                END AS TypeString 
                FROM Finance.ChartOfAccounts AS coa 
                WHERE coa.IsLowestLevel = 1 
                ORDER BY coa.AccountCode
            `);
        res.json(result.recordset);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch COA: ' + err.message });
    }
};

export const checkPermissions = async (req: Request, res: Response) => {
    try {
        const { companyCode, user } = req.user;
        const { formIds } = req.query; // Expecting comma separated string

        if (!formIds) return res.json({});

        const ids = (formIds as string).split(',').map(id => parseInt(id));
        const permissions: Record<number, boolean> = {};

        for (const id of ids) {
            permissions[id] = await checkPermission(companyCode, user, id);
        }

        res.json(permissions);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check permissions: ' + err.message });
    }
};
