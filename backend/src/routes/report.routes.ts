import express from 'express';
import { getBukuBesarSummary, getLedgerList, getChartOfAccounts, checkPermissions } from '../controllers/report.controller';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = express.Router();

router.use(tenantMiddleware);

router.get('/buku-besar-summary', getBukuBesarSummary);
router.get('/ledger-list', getLedgerList);
router.get('/coa-lookup', getChartOfAccounts);
router.get('/check-permissions', checkPermissions);

export default router;
