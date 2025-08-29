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
  referredBy?: string; // Who brought in this contact
  linkedinConnections?: string[]; // Mutual LinkedIn connections
  currentProjects?: string; // What they're working on
  mutualBenefit?: string; // Potential benefits for us
  cooperationRating: number; // 1-5 rating of willingness to cooperate
  affiliation?: string; // KOF Alumni, Dataservice Customer, etc.
}

export interface Interaction {
  id: string;
  type: 'meeting' | 'call' | 'email' | 'coffee' | 'event' | 'other';
  date: Date;
  description: string;
  outcome?: string;
  contactedBy?: string; // Who from our side had the contact
  channel?: string; // LinkedIn, Phone, In-person, etc.
  evaluation?: string; // Short evaluation of the meeting
}

export interface ContactStats {
  total: number;
  recentContacts: number;
  companies: number;
  tags: number;
}