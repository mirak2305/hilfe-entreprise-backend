import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { superAdminMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes accessibles par super admin seulement
router.get('/companies', superAdminMiddleware, AdminController.getCompanies);
router.post('/companies', superAdminMiddleware, AdminController.createCompany);

// Routes accessibles par admin de compagnie et super admin
router.get('/companies/:companyId/users', adminMiddleware, AdminController.getCompanyUsers);
router.post('/users', adminMiddleware, AdminController.createUser);
router.get('/companies/:companyId/documents', adminMiddleware, AdminController.getCompanyDocuments);

// Route pour récupérer les pays (accessible par tous les admins)
router.get('/countries', adminMiddleware, AdminController.getCountries);

export const adminRoutes = router;
