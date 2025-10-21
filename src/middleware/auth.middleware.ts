import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SupabaseService } from '../services/supabase.service';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token d\\'authentification manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await SupabaseService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Compte inactif' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await authMiddleware(req, res, () => {
      if (req.user?.role !== 'super_admin' && req.user?.role !== 'company_admin') {
        return res.status(403).json({ error: 'Accès administrateur requis' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Accès non autorisé' });
  }
};

export const superAdminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await authMiddleware(req, res, () => {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Accès super administrateur requis' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Accès non autorisé' });
  }
};
