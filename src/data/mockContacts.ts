import { Contact } from '@/types/contact';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp',
    position: 'Senior Product Manager',
    tags: ['product', 'tech', 'mentor'],
    notes: 'Met at ProductCon 2024. Very knowledgeable about AI/ML products. Interested in collaboration on user research.',
    lastContact: new Date('2024-01-15'),
    addedDate: new Date('2024-01-10'),
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahchen',
      twitter: 'https://twitter.com/sarahchen'
    },
    referredBy: 'Alex Thompson',
    linkedinConnections: ['John Davis', 'Maria Garcia', 'Alex Thompson'],
    currentProjects: 'Leading AI-powered user analytics platform launch',
    mutualBenefit: 'Access to enterprise AI/ML insights and potential partnership opportunities',
    cooperationRating: 4,
    interactionHistory: [
      {
        id: '1',
        type: 'meeting',
        date: new Date('2024-01-15'),
        description: 'Coffee meeting to discuss product strategy',
        outcome: 'Agreed to share user research insights'
      }
    ]
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@startupxyz.com',
    phone: '+1 (555) 987-6543',
    company: 'StartupXYZ',
    position: 'Co-founder & CTO',
    tags: ['startup', 'tech', 'founder'],
    notes: 'Brilliant engineer turned entrepreneur. Building next-gen fintech solutions. Great potential for partnership.',
    lastContact: new Date('2024-01-20'),
    addedDate: new Date('2024-01-05'),
    socialLinks: {
      linkedin: 'https://linkedin.com/in/marcusrodriguez',
      github: 'https://github.com/marcusrod'
    },
    referredBy: 'Sarah Chen',
    linkedinConnections: ['David Kim', 'Sarah Chen', 'Lisa Park'],
    currentProjects: 'Building fintech API platform with focus on developer experience',
    mutualBenefit: 'Technical expertise in fintech and potential integration opportunities',
    cooperationRating: 5,
    interactionHistory: [
      {
        id: '2',
        type: 'call',
        date: new Date('2024-01-20'),
        description: 'Technical discussion about API integration',
        outcome: 'Scheduled follow-up meeting for next week'
      }
    ]
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily.watson@designstudio.com',
    company: 'Creative Design Studio',
    position: 'UX Director',
    tags: ['design', 'UX', 'creative'],
    notes: 'Award-winning UX designer. Led design for several successful apps. Could be valuable for design consulting.',
    lastContact: new Date('2024-01-18'),
    addedDate: new Date('2024-01-12'),
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emilywatson'
    },
    referredBy: 'LinkedIn Connection',
    linkedinConnections: ['Marcus Rodriguez', 'Tom Wilson'],
    currentProjects: 'Redesigning mobile banking experience for major financial institution',
    mutualBenefit: 'Design expertise and access to enterprise design processes',
    cooperationRating: 3,
    interactionHistory: []
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@venturecap.com',
    phone: '+1 (555) 456-7890',
    company: 'Venture Capital Partners',
    position: 'Principal',
    tags: ['investor', 'VC', 'finance'],
    notes: 'Active investor in early-stage tech companies. Focus on B2B SaaS and AI. Met through referral.',
    addedDate: new Date('2024-01-08'),
    socialLinks: {
      linkedin: 'https://linkedin.com/in/davidkim'
    },
    referredBy: 'Emily Watson',
    linkedinConnections: ['Marcus Rodriguez', 'Sarah Chen', 'Jessica Liu'],
    currentProjects: 'Leading Series A investments in AI startups and developer tools',
    mutualBenefit: 'Funding opportunities and connections to portfolio companies',
    cooperationRating: 2,
    interactionHistory: []
  }
];