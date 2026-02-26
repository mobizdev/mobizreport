import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.config';
import { getSystemDbInfo, getSystemPool } from '../services/tenant.service';
import { verifyExternalToken } from '../utils/auth.utils';

export const verifyAuth = async (req: Request, res: Response) => {
    console.log('auth:req.query:', req.query)
    const { companycode } = req.params;
    const { token } = req.query;

    if (!companycode || !token) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const tenantSystem = await getSystemDbInfo(companycode);
    if (!tenantSystem) {
        return res.status(404).json({ error: 'Tenant not found' });
    }

    const result = verifyExternalToken(token as string);
    if (!result) {
        return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (result.expired) {
        return res.status(401).json({ error: 'Token has expired' });
    }

    // 2. Koneksi ke System DB untuk mencari CompanyId pertama
    const systemPool = await getSystemPool(companycode);
    const companyResult = await systemPool.request()
        .query('SELECT TOP 1 CompanyId FROM M1F_Companies');
    
    if (companyResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No company registered for this tenant.' });
    }

    const companyId = companyResult.recordset[0].CompanyId;

    const jwtToken = jwt.sign(
        { user: result.user, companyCode: companycode, companyId: companyId }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
    );

    res.json({
        token: jwtToken,
        user: result.user,
        companyCode: companycode,
        companyId: companyId
    });
};
