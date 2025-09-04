import { Contact, ContactOpportunity } from '@/types/contact';

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
    potentialScore: 5,
    affiliation: 'KOF Alumni',
    offering: 'AI/ML expertise, user research methodologies, enterprise connections',
    lookingFor: 'Technical partnerships, early-stage startup insights, developer talent',
    upcomingOpportunities: [
      {
        id: 'opp-1',
        type: 'conference',
        title: 'AI & Product Management Summit',
        date: new Date('2024-10-15'),
        location: 'Zurich Convention Center',
        description: 'Speaking on AI ethics in product development',
        registrationStatus: 'confirmed'
      },
      {
        id: 'opp-2',
        type: 'meeting',
        title: 'Golf & Strategy Session',
        date: new Date('2024-09-20'),
        location: 'Zurich Golf Club',
        description: 'Discussing potential AI collaboration over golf with Sarah and two other tech leads'
      },
      {
        id: 'opp-6',
        type: 'event',
        title: 'KOF Alumni Tech Mixer',
        date: new Date('2024-09-28'),
        location: 'ETH Zurich Campus',
        description: 'Quarterly networking event for KOF alumni in tech',
        registrationStatus: 'registered'
      }
    ],
    interactionHistory: [
      {
        id: '1',
        type: 'meeting',
        date: new Date('2024-01-15'),
        description: 'Coffee meeting to discuss product strategy',
        outcome: 'Agreed to share user research insights',
        contactedBy: 'John Smith',
        channel: 'In-person',
        evaluation: 'Very productive meeting, high potential for collaboration'
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
    potentialScore: 4,
    affiliation: 'Dataservice Customer',
    offering: 'Fintech API development, startup mentorship, technical architecture advice',
    lookingFor: 'Investment opportunities, enterprise clients, regulatory compliance expertise',
    upcomingOpportunities: [
      {
        id: 'opp-3',
        type: 'conference',
        title: 'Fintech Innovation Week',
        date: new Date('2024-09-25'),
        location: 'Basel Convention Center',
        description: 'Panel discussion on API standardization in banking',
        registrationStatus: 'confirmed'
      },
      {
        id: 'opp-7',
        type: 'meeting',
        title: 'Startup Founders Dinner',
        date: new Date('2024-09-22'),
        location: 'Private Dining Room, Hotel Baur au Lac',
        description: 'Exclusive dinner with 6 other fintech founders to discuss regulatory challenges'
      },
      {
        id: 'opp-8',
        type: 'other',
        title: 'Hackathon Judging',
        date: new Date('2024-10-05'),
        location: 'Impact Hub Zurich',
        description: 'Judging fintech track at Swiss Startup Hackathon'
      }
    ],
    interactionHistory: [
      {
        id: '2',
        type: 'call',
        date: new Date('2024-01-20'),
        description: 'Technical discussion about API integration',
        outcome: 'Scheduled follow-up meeting for next week',
        contactedBy: 'Maria Garcia',
        channel: 'Phone',
        evaluation: 'Excellent technical discussion, very cooperative and enthusiastic'
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
    potentialScore: 3,
    affiliation: 'Survey Participant Contact',
    offering: 'UX/UI design services, design system expertise, creative consulting',
    lookingFor: 'Product management insights, technical development partners, client referrals',
    upcomingOpportunities: [
      {
        id: 'opp-4',
        type: 'appointment',
        title: 'Coffee & Design Trends',
        date: new Date('2024-09-18'),
        location: 'Café Central, Zurich',
        description: 'Catching up on latest design trends and discussing potential UX consulting project'
      },
      {
        id: 'opp-9',
        type: 'event',
        title: 'Design Systems Meetup',
        date: new Date('2024-10-10'),
        location: 'Google Zurich Office',
        description: 'Monthly meetup for design professionals, Emily is presenting on mobile banking UX',
        registrationStatus: 'confirmed'
      },
      {
        id: 'opp-10',
        type: 'other',
        title: 'Weekend Workshop Facilitation',
        date: new Date('2024-10-12'),
        location: 'Design Thinking Studio, Bern',
        description: 'Co-facilitating design thinking workshop for non-profit organizations'
      }
    ],
    interactionHistory: [
      {
        id: '3',
        type: 'email',
        date: new Date('2024-01-18'),
        description: 'Follow-up on design collaboration proposal',
        outcome: 'Interested but currently busy with current project',
        contactedBy: 'Alex Thompson',
        channel: 'Email',
        evaluation: 'Positive response but limited availability in short term'
      }
    ]
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
    potentialScore: 2,
    affiliation: 'CIRET Member',
    offering: 'Investment capital, portfolio company connections, strategic guidance',
    lookingFor: 'High-growth B2B SaaS startups, AI/ML innovations, market expansion opportunities',
    upcomingOpportunities: [
      {
        id: 'opp-5',
        type: 'conference',
        title: 'European Venture Summit',
        date: new Date('2024-10-20'),
        location: 'Geneva International Conference Centre',
        description: 'Keynote on AI investment trends in Europe',
        registrationStatus: 'confirmed'
      },
      {
        id: 'opp-11',
        type: 'meeting',
        title: 'Portfolio Company Board Meeting',
        date: new Date('2024-09-19'),
        location: 'VC Partners Office, Zurich',
        description: 'Quarterly board meeting with 3 portfolio companies, networking lunch afterwards'
      },
      {
        id: 'opp-12',
        type: 'event',
        title: 'Private Investor Networking',
        date: new Date('2024-09-30'),
        location: 'Exclusive Members Club, Geneva',
        description: 'Monthly gathering of Swiss VCs and angel investors',
        registrationStatus: 'registered'
      }
    ],
    interactionHistory: []
  }
];