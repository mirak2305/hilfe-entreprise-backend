export interface User {
  id: string;
  company_id?: string;
  hr_id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  phone_country_code?: string;
  role: 'user' | 'company_admin' | 'super_admin';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export interface Company {
  id: string;
  name: string;
  country_id: string;
  status: 'active' | 'suspended' | 'terminated';
  billing_email?: string;
  technical_email?: string;
  commercial_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  category?: 'technical_support' | 'weather_confirmation' | 'quote_analysis' | 'email_generation' | 'other';
  documents_used?: string[];
  external_sources_used?: string[];
  tokens_used: number;
  confidence_score?: number;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  hr_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_id: string;
}
