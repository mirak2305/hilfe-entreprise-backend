import { createClient } from '@supabase/supabase-js';
import { User, Company, Country, Conversation, Message } from '../types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  // USERS
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'last_login'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserByHrId(companyId: string, hrId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('hr_id', hrId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getCompanyUsers(companyId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) throw error;
    return data;
  }

  static async updateUserPassword(userId: string, passwordHash: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUserLastLogin(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // COMPANIES
  static async createCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getCompanyById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAllCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  // COUNTRIES
  static async getAllCountries() {
    const { data, error } = await supabase
      .from('countries')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  // CONVERSATIONS
  static async createConversation(conversationData: Omit<Conversation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('conversations')
      .insert([conversationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getConversationById(id: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // MESSAGES
  static async createMessage(messageData: Omit<Message, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // FOLDERS (pour plus tard)
  static async getCompanyFolders(companyId: string) {
    const { data, error } = await supabase
      .from('company_folders')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
}
