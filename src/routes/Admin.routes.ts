import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { superAdminMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes super admin seulement
router.get('/companies', superAdminMiddleware, AdminController.getCompanies);
router.post('/companies', superAdminMiddleware, AdminController.createCompany);

// Routes admin de compagnie
router.get('/companies/:companyId/users', adminMiddleware, AdminController.getCompanyUsers);
router.post('/users', adminMiddleware, AdminController.createUser);
router.get('/companies/:companyId/documents', adminMiddleware, AdminController.getCompanyDocuments);

export const adminRoutes = router;
