import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SupabaseService } from '../services/supabase.service';
import { EmailService } from '../services/email.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }

      const user = await SupabaseService.getUserByEmail(email);
     
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Compte inactif' });
      }

      if (!user.password_hash) {
        return res.status(401).json({ error: 'Mot de passe non configuré' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          companyId: user.company_id
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Mettre à jour la dernière connexion
      await SupabaseService.updateUserLastLogin(user.id);

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
          company_id: user.company_id
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          role: req.user.role,
          status: req.user.status,
          company_id: req.user.company_id,
          last_login: req.user.last_login
        }
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
  }

  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
      }

      const user = await SupabaseService.getUserById(userId);
     
      if (!user.password_hash) {
        return res.status(400).json({ error: 'Mot de passe non configuré' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await SupabaseService.updateUserPassword(userId, newPasswordHash);

      res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
    }
  }
}
