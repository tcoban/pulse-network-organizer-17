export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  tags: string[];
  notes: string;
  lastContact?: Date;
  addedDate: Date;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  customFields?: Record<string, string>;
  interactionHistory: Interaction[];
}

export interface Interaction {
  id: string;
  type: 'meeting' | 'call' | 'email' | 'coffee' | 'event' | 'other';
  date: Date;
  description: string;
  outcome?: string;
}

export interface ContactStats {
  total: number;
  recentContacts: number;
  companies: number;
  tags: number;
}