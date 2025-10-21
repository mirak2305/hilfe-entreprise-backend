import { Request, Response } from 'express';
import { SupabaseService } from '../services/supabase.service';
import { EmailService } from '../services/email.service';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.middleware';

export class AdminController {
  // Gestion des compagnies
  static async getCompanies(req: AuthRequest, res: Response) {
    try {
      const companies = await SupabaseService.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error('Get companies error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des compagnies' });
    }
  }

  static async createCompany(req: AuthRequest, res: Response) {
    try {
      const { name, country_id, billing_email, technical_email, commercial_email } = req.body;
      
      const company = await SupabaseService.createCompany({
        name,
        country_id,
        billing_email,
        technical_email,
        commercial_email,
        status: 'active'
      });

      res.status(201).json(company);
    } catch (error) {
      console.error('Create company error:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la compagnie' });
    }
  }

  // Gestion des utilisateurs
  static async getCompanyUsers(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      const users = await SupabaseService.getCompanyUsers(companyId);
      res.json(users);
    } catch (error) {
      console.error('Get company users error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  }

  static async createUser(req: AuthRequest, res: Response) {
    try {
      const { company_id, hr_id, email, first_name, last_name, phone, phone_country_code } = req.body;
      
      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const user = await SupabaseService.createUser({
        company_id,
        hr_id,
        email,
        first_name,
        last_name,
        phone,
        phone_country_code,
        password_hash: passwordHash,
        role: 'user',
        status: 'active'
      });

      // Envoyer l'email avec le mot de passe
      await EmailService.sendPasswordEmail(email, tempPassword, `${first_name} ${last_name}`);

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id: user.id,
          hr_id: user.hr_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\\'utilisateur' });
    }
  }

  // Gestion des documents
  static async getCompanyDocuments(req: AuthRequest, res: Response) {
    try {
      // Implémentation pour récupérer les documents d'une compagnie
      res.json({ message: 'Documents endpoint - à implémenter' });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
    }
  }
}
