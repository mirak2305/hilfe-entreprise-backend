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
      
      if (!name || !country_id) {
        return res.status(400).json({ error: 'Nom et pays sont requis' });
      }

      const company = await SupabaseService.createCompany({
        name,
        country_id,
        billing_email,
        technical_email,
        commercial_email,
        status: 'active'
      });

      res.status(201).json({
        message: 'Compagnie créée avec succès',
        company
      });
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
      const { company_id, hr_id, email, first_name, last_name, phone, phone_country_code, role } = req.body;
      
      // Validation des champs requis
      if (!company_id || !hr_id || !email || !first_name || !last_name) {
        return res.status(400).json({ 
          error: 'Tous les champs sont requis: company_id, hr_id, email, first_name, last_name' 
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await SupabaseService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
      }

      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
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
        role: role || 'user',
        status: 'active'
      });

      // Envoyer l'email avec le mot de passe
      await EmailService.sendPasswordEmail(email, tempPassword, `${first_name} ${last_name}`);

      // Ne pas renvoyer le hash du mot de passe
      const { password_hash, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: userWithoutPassword,
        tempPassword: tempPassword // Seulement pour debug - à retirer en prod
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\\'utilisateur' });
    }
  }

  // Gestion des documents
  static async getCompanyDocuments(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.params;
      
      // Pour l'instant, retourner un message
      // Plus tard, on implémentera la gestion des documents
      res.json({ 
        message: 'Gestion des documents - à implémenter',
        companyId 
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
    }
  }

  // Récupérer tous les pays
  static async getCountries(req: AuthRequest, res: Response) {
    try {
      const countries = await SupabaseService.getAllCountries();
      res.json(countries);
    } catch (error) {
      console.error('Get countries error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des pays' });
    }
  }
}
