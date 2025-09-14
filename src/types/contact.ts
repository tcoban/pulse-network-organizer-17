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
  eventParticipationHistory: EventParticipation[]; // Past KOF events attended
  pastCollaborations: PastCollaboration[]; // Past successful collaborations
  referredBy?: string; // Who brought in this contact
  linkedinConnections?: string[]; // Mutual LinkedIn connections
  currentProjects?: string; // What they're working on
  mutualBenefit?: string; // Potential benefits for us
  cooperationRating: number; // 1-5 rating of willingness to cooperate
  potentialScore: number; // 1-5 potential value score based on past collaborations
  affiliation?: string; // KOF Alumni, Dataservice Customer, etc.
  offering?: string; // What they can offer to help others
  lookingFor?: string; // What they are looking for from others
  upcomingOpportunities?: ContactOpportunity[]; // Registered events, appointments, etc.
  assignedTo: string; // Team member assigned to this contact
  createdBy?: string; // Who originally created this contact
  preferences?: ContactPreferences; // Communication preferences
}

export interface ContactPreferences {
  language: string; // Preferred communication language
  preferredChannel: 'email' | 'phone' | 'linkedin' | 'in-person' | 'video-call' | 'other';
  availableTimes?: string; // When they're available for meetings
  meetingLocation?: string; // Preferred meeting location/venue
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

export interface ContactOpportunity {
  id: string;
  type: 'event' | 'meeting' | 'appointment' | 'conference' | 'other';
  title: string;
  date: Date;
  location?: string;
  description?: string;
  registrationStatus?: 'registered' | 'considering' | 'confirmed';
  meetingGoals?: MeetingGoal[];
}

export interface MeetingGoal {
  id: string;
  description: string;
  achieved: boolean;
}

export interface EventParticipation {
  id: string;
  eventName: string;
  eventType: string;
  eventDate: Date;
  location?: string;
  participationType?: string; // speaker, attendee, organizer, etc.
  notes?: string;
}

export interface PastCollaboration {
  id: string;
  projectName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  outcome?: string;
  successRating?: number; // 1-5 rating
  createdBy?: string;
}

export interface ContactStats {
  total: number;
  recentContacts: number;
  companies: number;
  tags: number;
  openMatches: number;
}