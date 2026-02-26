import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.config';
import { getAccountingPool } from '../services/tenant.service';

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { user, companyCode, companyId }

        // Use the connection string from M1F_Companies via getAccountingPool
        const pool = await getAccountingPool(decoded.companyCode, decoded.companyId);
        req.db = pool;
        
        next();
    } catch (err: any) {
        console.error('Tenant Middleware Error:', err.message);
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
};
