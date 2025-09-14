import { Contact, ContactOpportunity } from '@/types/contact';

// Swiss team members for realistic demo data
export const teamMembers = [
  "Markus Müller", "Anna Schneider", "Stefan Weber", "Sarah Meier", "Thomas Fischer",
  "Nina Zimmermann", "David Schmid", "Julia Keller", "Michael Brunner", "Lisa Baumann",
  "Patrick Huber", "Carmen Steiner", "Daniel Wolf", "Claudia Gerber", "Marco Roth",
  "Sandra Bauer", "Andreas Graf", "Simone Hofer", "Beat Wyss", "Petra Frei"
];

const getRandomTeamMember = () => {
  return teamMembers[Math.floor(Math.random() * teamMembers.length)];
};

// Helper function to generate random dates in the past
const getRandomPastDate = (daysAgo: number) => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(today);
  date.setDate(date.getDate() - randomDays);
  return date;
};

// Helper function to generate random future dates
const getRandomFutureDate = (daysAhead: number) => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * daysAhead) + 1;
  const date = new Date(today);
  date.setDate(date.getDate() + randomDays);
  return date;
};

export const mockContacts: Contact[] = [
  // Original contacts with fixes
  {
    id: '1',
    name: 'Sarah Chen',
    assignedTo: 'Sophie Meier',
    createdBy: 'Sophie Meier',
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
        registrationStatus: 'confirmed',
        meetingGoals: [
          { id: 'goal-1', description: 'Network with 5 new AI product managers', achieved: false },
          { id: 'goal-2', description: 'Present our AI ethics framework', achieved: false },
          { id: 'goal-3', description: 'Schedule follow-up meetings with 3 potential partners', achieved: false }
        ]
      },
      {
        id: 'opp-2',
        type: 'meeting',
        title: 'Golf & Strategy Session',
        date: new Date('2024-09-22'),
        location: 'Zurich Golf Club',
        description: 'Casual networking and strategic discussions',
        registrationStatus: 'confirmed',
        meetingGoals: [
          { id: 'goal-4', description: 'Discuss potential collaboration on AI ethics project', achieved: true },
          { id: 'goal-5', description: 'Explore investment opportunities', achieved: false }
        ]
      }
    ],
    preferences: {
      language: 'English',
      preferredChannel: 'email',
      availableTimes: 'Weekday mornings, preferably 9-11 AM',
      meetingLocation: 'Zurich office or virtual meetings'
    },
    interactionHistory: [
      {
        id: '1',
        type: 'meeting',
        date: new Date('2024-01-15'),
        description: 'Coffee meeting to discuss product strategy',
        outcome: 'Agreed to share user research insights',
        contactedBy: 'Sophie Meier',
        channel: 'In-person',
        evaluation: 'Very productive meeting, high potential for collaboration'
      }
    ],
    eventParticipationHistory: [
      {
        id: '1',
        eventName: 'KOF Digital Transformation Summit 2023',
        eventType: 'conference',
        eventDate: new Date('2023-11-15'),
        location: 'ETH Zurich',
        participationType: 'speaker',
        notes: 'Keynote on AI governance'
      }
    ],
    pastCollaborations: [
      {
        id: '1',
        projectName: 'Swiss AI Policy Framework',
        description: 'Joint research on AI regulation policies',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-06-30'),
        outcome: 'Published white paper on AI governance',
        successRating: 5,
        createdBy: 'Sophie Meier'
      }
    ]
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    assignedTo: 'Luca Müller',
    createdBy: 'Sophie Meier',
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
      }
    ],
    preferences: {
      language: 'English',
      preferredChannel: 'phone',
      availableTimes: 'Afternoon calls after 2 PM, flexible weekends',
      meetingLocation: 'Prefer virtual meetings or coffee shops in Basel'
    },
    interactionHistory: [
      {
        id: '2',
        type: 'call',
        date: new Date('2024-01-20'),
        description: 'Technical discussion about API integration',
        outcome: 'Scheduled follow-up meeting for next week',
        contactedBy: 'Luca Müller',
        channel: 'Phone',
        evaluation: 'Excellent technical discussion, very cooperative and enthusiastic'
      }
    ],
    eventParticipationHistory: [
      {
        id: '2',
        eventName: 'KOF Business Sentiment Survey Launch',
        eventType: 'event',
        eventDate: new Date('2023-09-20'),
        location: 'Zurich',
        participationType: 'attendee',
        notes: 'Networking event'
      }
    ],
    pastCollaborations: []
  },
  {
    id: '3',
    name: 'Emily Watson',
    assignedTo: 'Noah Schmid',
    createdBy: 'Noah Schmid',
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
      }
    ],
    interactionHistory: [
      {
        id: '3',
        type: 'email',
        date: new Date('2024-01-18'),
        description: 'Follow-up on design collaboration proposal',
        outcome: 'Interested but currently busy with current project',
        contactedBy: 'Noah Schmid',
        channel: 'Email',
        evaluation: 'Positive response but limited availability in short term'
      }
    ],
    eventParticipationHistory: [
      {
        id: '3',
        eventName: 'Tech4Good Switzerland Meetup',
        eventType: 'meetup',
        eventDate: new Date('2023-12-05'),
        location: 'Impact Hub Zurich',
        participationType: 'participant',
        notes: 'Pitched sustainability platform'
      }
    ],
    pastCollaborations: [
      {
        id: '2',
        projectName: 'EcoTech Accelerator',
        description: 'Mentorship program for green startups',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-08-31'),
        outcome: 'Successfully launched 3 startups',
        successRating: 4,
        createdBy: 'Noah Schmid'
      }
    ]
  },
  {
    id: '4',
    name: 'David Kim',
    assignedTo: 'Laura Keller',
    createdBy: 'Noah Schmid',
    email: 'david@venturecap.com',
    phone: '+1 (555) 456-7890',
    company: 'Venture Capital Partners',
    position: 'Principal',
    tags: ['investor', 'VC', 'finance'],
    notes: 'Active investor in early-stage tech companies. Focus on B2B SaaS and AI. Met through referral.',
    lastContact: new Date('2023-06-15'),
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
      }
    ],
    interactionHistory: [],
    eventParticipationHistory: [],
    pastCollaborations: []
  },
  // Continue with remaining 146 contacts
  ...Array.from({ length: 146 }, (_, index) => {
    const id = (index + 5).toString();
    const names = [
      'Dr. Lisa Müller', 'Andreas Weber', 'Jennifer Chang', 'Roberto Silva', 'Yuki Tanaka', 'Sophie Dubois',
      'Michael O\'Brien', 'Priya Patel', 'Thomas Schmidt', 'Isabella Rossi', 'Ahmed Al-Rashid', 'Emma Thompson',
      'Lars Andersen', 'Maria Santos', 'Viktor Petrov', 'Rachel Green', 'Hendrik van der Berg', 'Chen Wei',
      'Olumide Adebayo', 'Astrid Nielsen', 'François Dubois', 'James Mitchell', 'Fatima Al-Zahra', 'Erik Johansson',
      'Claudia Romano', 'Dmitri Volkov', 'Ananya Sharma', 'Pedro Gonzalez', 'Ingrid Larsen', 'Kenji Nakamura',
      'Beatrice Müller', 'Omar Hassan', 'Lucia Fernandez', 'Raj Gupta',
      'Nadia Petersen', 'Alexandre Costa', 'Zara Ahmed', 'Matteo Bianchi', 'Leila Kristensen', 'Hans Andersson',
      'Carmen Rodriguez', 'Hiroshi Yamamoto', 'Elena Kozlov', 'Finn O\'Sullivan', 'Amelia Clarke', 'Giorgio Rossi',
      'Anya Popov', 'Kai Lindqvist', 'Rosa Martinez', 'Takeshi Sato', 'Nina Johansson', 'Carlos Mendoza',
      'Svetlana Volkov', 'Magnus Nielsen', 'Sofia Greco', 'Akira Tanaka', 'Birgit Hansen', 'Diego Silva',
      'Katarina Borg', 'Ravi Kumar', 'Anastasia Petrov', 'Björn Eriksson', 'Francesca Romano', 'Masaki Ito',
      'Astrid Poulsen', 'Gabriel Costa', 'Irina Sokolova', 'Thor Madsen', 'Valentina Conti', 'Hana Nakamura',
      'Olav Kristiansen', 'Paulo Santos', 'Zoya Kuznetsov', 'Axel Lindgren', 'Chiara Marini', 'Ryota Suzuki',
      'Karin Dahl', 'Miguel Torres', 'Vera Popova', 'Gunnar Holm', 'Alessandra Ricci', 'Kenzo Yamada',
      'Liv Haugen', 'Andre Silva', 'Oksana Petrov', 'Sven Karlsson', 'Giulia Rosso', 'Satoshi Mori',
      'Inger Berg', 'Ricardo Lopez', 'Marina Volkov', 'Nils Andersen', 'Serena Bianchi', 'Daiki Nishimura',
      'Maja Lundberg', 'Francisco Dias', 'Polina Smirnova', 'Ragnar Olsen', 'Benedetta Conti', 'Yusuke Taniguchi',
      'Ida Nilsson', 'Vasco Pereira', 'Galina Kozlov', 'Leif Magnusson', 'Flaminia Romano', 'Shinji Watanabe',
      'Sigrid Moen', 'Bruno Almeida', 'Larisa Volkov', 'Viktor Gustafsson', 'Camilla Greco', 'Taro Ishida',
      'Thea Strand', 'Joao Ferreira', 'Ekaterina Popov', 'Emil Svensson', 'Federica Rossi', 'Kota Yamamoto',
      'Ragnhild Dale', 'Henrique Costa', 'Darya Petrov', 'Oscar Persson', 'Elisa Romano', 'Jun Sasaki',
      'Solveig Haugen', 'Tiago Silva', 'Yelena Kuznets', 'Filip Hedberg', 'Paola Bianchi', 'Shin Takahashi',
      'Kaja Dahl', 'Rafael Martins', 'Anastasiya Volkov', 'Mats Lindström', 'Giorgia Conti', 'Daisuke Ito',
      'Astrid Moen', 'Lucas Pereira', 'Milana Popov', 'Tobias Johnsson', 'Simona Romano', 'Keisuke Nakano',
      'Ingvild Berg', 'Gustavo Santos', 'Alina Petrov', 'Johan Eriksson'
    ];
    
    const companies = [
      'Swiss MedTech AG', 'Global Manufacturing Solutions', 'RetailTech Innovations', 'Finance Plus Brasil',
      'Tokyo Innovation Labs', 'Dubois Consulting', 'Dublin Tech Solutions', 'Mumbai Analytics',
      'Schmidt Engineering', 'Milano Design Studio', 'Al-Rashid Holdings', 'Thompson & Associates',
      'Nordic Systems', 'Santos & Partners', 'Petrov Industries', 'Green Solutions', 'Berg Ventures',
      'Wei Technologies', 'Lagos Innovations', 'Copenhagen Analytics', 'Paris Consulting Group',
      'Mitchell Corp', 'Al-Zahra Enterprises', 'Stockholm Ventures', 'Romano Holdings', 'Moscow Tech',
      'Sharma Analytics', 'Barcelona Solutions', 'Oslo Systems', 'Nakamura Industries',
      'TechNova Solutions', 'Digital Innovation Lab', 'Global Systems Corp', 'NextGen Technologies',
      'Smart Enterprise Solutions', 'Innovation Hub', 'Future Systems', 'Advanced Technologies',
      'Digital Transformation Partners', 'Enterprise Solutions Group', 'Tech Innovations Inc',
      'Strategic Solutions', 'Digital Excellence', 'Innovation Partners', 'Technology Ventures',
      'Advanced Systems', 'Digital Solutions Pro', 'Tech Leadership Group', 'Innovation Labs',
      'Future Technologies', 'Digital Pioneers', 'Advanced Analytics', 'Smart Solutions',
      'Technology Partners', 'Digital Dynamics', 'Innovation Systems', 'Tech Ventures',
      'Digital Strategy Group', 'Advanced Solutions', 'Technology Leaders', 'Smart Analytics',
      'Digital Transformation', 'Innovation Technologies', 'Tech Solutions Pro', 'Future Analytics',
      'Digital Innovation Partners', 'Advanced Technology Group', 'Smart Enterprise',
      'Technology Solutions', 'Digital Ventures', 'Innovation Dynamics', 'Tech Excellence',
      'Digital Leaders', 'Advanced Innovation', 'Smart Technology', 'Future Solutions'
    ];

    const positions = [
      'CEO', 'CTO', 'VP of Engineering', 'Head of Product', 'Director of Innovation', 'Chief Data Officer',
      'Senior Manager', 'Principal Consultant', 'Lead Developer', 'Research Director', 'VP of Sales',
      'Head of Marketing', 'Chief Strategy Officer', 'Senior Analyst', 'Product Manager', 'Tech Lead',
      'CEO', 'CTO', 'VP of Engineering', 'Director of Innovation', 'Head of Product',
      'Chief Data Officer', 'VP of Technology', 'Innovation Manager', 'Tech Lead',
      'Product Manager', 'Engineering Director', 'Chief Technology Officer',
      'Head of Digital Transformation', 'VP of Data Science', 'Innovation Director',
      'Technology Manager', 'Digital Strategy Director', 'Head of AI/ML',
      'VP of Product Development', 'Chief Innovation Officer'
    ];

    const affiliations = [
      'ETH Alumni', 'University of Zurich', 'EPFL Graduate', 'MIT Alumni', 'Stanford Graduate',
      'Harvard Business School', 'Oxford University', 'Cambridge Graduate', 'Wharton School',
      'INSEAD Alumni', 'London Business School', 'Berkeley Graduate', 'NYU Stern', 'Columbia Business School',
      'Chicago Booth', 'Kellogg School', 'Sloan School', 'IESE Business School', 'IMD Lausanne',
      'ETH Alumni', 'KOF Alumni', 'Dataservice Customer', 'CIRET Member', 'Survey Participant Contact',
      'Conference Contact', 'LinkedIn Connection', 'Industry Association Member', 'Trade Show Contact',
      'Research Collaboration Partner', 'University Connection', 'Professional Network',
      'Industry Expert', 'Advisory Board Member', 'Strategic Partner'
    ];

    const tags = [
      'tech', 'finance', 'healthcare', 'manufacturing', 'retail', 'consulting', 'startup', 'enterprise',
      'AI/ML', 'blockchain', 'fintech', 'medtech', 'IoT', 'cybersecurity', 'data-science', 'cloud',
      'mobile', 'web3', 'SaaS', 'B2B', 'B2C', 'international', 'emerging-markets', 'sustainability',
      'AI', 'machine-learning', 'tech', 'fintech', 'payments', 'finance', 'healthcare', 'medtech', 'digital-health',
      'manufacturing', 'industry-4.0', 'IoT', 'retail', 'e-commerce', 'customer-experience',
      'education', 'edtech', 'digital-learning', 'energy', 'cleantech', 'sustainability',
      'automotive', 'mobility', 'autonomous-systems', 'cybersecurity', 'data-protection', 'security',
      'blockchain', 'crypto', 'web3', 'gaming', 'VR', 'entertainment', 'logistics', 'supply-chain', 'transportation',
      'real-estate', 'proptech', 'smart-buildings', 'insurance', 'insurtech', 'risk-management',
      'agriculture', 'agtech', 'farming', 'aerospace', 'space-tech', 'satellites',
      'biotech', 'pharma', 'life-sciences', 'legal', 'legaltech', 'compliance',
      'marketing', 'adtech', 'digital-marketing', 'HR', 'talent', 'workforce-management'
    ];

    const creator = getRandomTeamMember();
    const lastContactPerson = Math.random() > 0.7 ? getRandomTeamMember() : creator;
    const assignedTo = lastContactPerson;
    
    const contact: Contact = {
      id,
      name: names[index % names.length] || `Contact ${index + 5}`,
      assignedTo,
      createdBy: creator,
      email: `${names[index % names.length]?.toLowerCase().replace(/\s+/g, '.').replace(/'/g, '') || `contact${index + 5}`}@${companies[index % companies.length]?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`,
      phone: `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
      company: companies[index % companies.length] || `Company ${index + 5}`,
      position: positions[index % positions.length] || 'Manager',
      tags: [tags[index % tags.length], tags[(index + 1) % tags.length], tags[(index + 2) % tags.length]].slice(0, Math.floor(Math.random() * 3) + 1),
      notes: `Professional contact with expertise in ${tags[index % tags.length]}. ${Math.random() > 0.5 ? 'High potential for collaboration.' : 'Maintaining relationship for future opportunities.'}`,
      lastContact: Math.random() > 0.3 ? getRandomPastDate(365) : undefined,
      addedDate: getRandomPastDate(500),
      socialLinks: {
        linkedin: `https://linkedin.com/in/${names[index % names.length]?.toLowerCase().replace(/\s+/g, '') || `contact${index + 5}`}`,
        ...(Math.random() > 0.8 && { twitter: `https://twitter.com/${names[index % names.length]?.toLowerCase().replace(/\s+/g, '') || `contact${index + 5}`}` })
      },
      referredBy: Math.random() > 0.6 ? names[Math.floor(Math.random() * names.length)] : undefined,
      linkedinConnections: Math.random() > 0.5 ? [names[Math.floor(Math.random() * names.length)], names[Math.floor(Math.random() * names.length)]].filter(Boolean) : [],
      currentProjects: Math.random() > 0.4 ? `Working on ${tags[index % tags.length]} initiatives for enterprise clients` : undefined,
      mutualBenefit: Math.random() > 0.5 ? `Potential collaboration in ${tags[index % tags.length]} and strategic partnerships` : undefined,
      cooperationRating: Math.floor(Math.random() * 5) + 1,
      potentialScore: Math.floor(Math.random() * 5) + 1,
      affiliation: Math.random() > 0.4 ? affiliations[index % affiliations.length] : undefined,
      offering: Math.random() > 0.5 ? `${tags[index % tags.length]} expertise, industry connections, strategic consulting` : undefined,
      lookingFor: Math.random() > 0.5 ? `Partnership opportunities, ${tags[(index + 1) % tags.length]} solutions, market expansion` : undefined,
      upcomingOpportunities: Math.random() > 0.7 ? [
        {
          id: `opp-${id}`,
          type: ['conference', 'meeting', 'event'][Math.floor(Math.random() * 3)] as any,
          title: `${tags[index % tags.length].toUpperCase()} ${['Summit', 'Conference', 'Meeting', 'Workshop'][Math.floor(Math.random() * 4)]}`,
          date: getRandomFutureDate(90),
          location: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'][Math.floor(Math.random() * 5)],
          description: `Professional networking and ${tags[index % tags.length]} discussion`,
          registrationStatus: ['registered', 'considering', 'confirmed'][Math.floor(Math.random() * 3)] as any,
          ...(Math.random() > 0.5 && {
            meetingGoals: [
              { id: `goal-${id}-1`, description: `Discuss ${tags[index % tags.length]} collaboration opportunities`, achieved: Math.random() > 0.5 },
              { id: `goal-${id}-2`, description: 'Exchange industry insights and best practices', achieved: Math.random() > 0.5 }
            ]
          })
        }
      ] : [],
      interactionHistory: Math.random() > 0.4 ? [
        {
          id: `interaction-${id}`,
          type: ['meeting', 'call', 'email', 'event'][Math.floor(Math.random() * 4)] as any,
          date: getRandomPastDate(200),
          description: `Discussion about ${tags[index % tags.length]} opportunities and potential collaboration`,
          outcome: Math.random() > 0.5 ? 'Positive discussion, agreed to follow up' : 'Initial contact established, exploring opportunities',
          contactedBy: lastContactPerson,
          channel: ['LinkedIn', 'Phone', 'Email', 'In-person'][Math.floor(Math.random() * 4)],
          evaluation: Math.random() > 0.5 ? 'Productive conversation, high potential' : 'Good initial contact, need to develop relationship further'
        }
      ] : [],
      eventParticipationHistory: Math.random() > 0.6 ? [
        {
          id: `event-${id}`,
          eventName: `KOF ${tags[index % tags.length].toUpperCase()} Conference ${2023 + Math.floor(Math.random() * 2)}`,
          eventType: ['conference', 'workshop', 'seminar', 'meetup'][Math.floor(Math.random() * 4)],
          eventDate: getRandomPastDate(365),
          location: ['Zurich', 'Geneva', 'Basel', 'Bern'][Math.floor(Math.random() * 4)],
          participationType: ['speaker', 'attendee', 'organizer', 'panelist'][Math.floor(Math.random() * 4)],
          notes: Math.random() > 0.5 ? `Active participation in ${tags[index % tags.length]} discussions` : undefined
        }
      ] : [],
      pastCollaborations: Math.random() > 0.7 ? [
        {
          id: `collab-${id}`,
          projectName: `${tags[index % tags.length].toUpperCase()} Innovation Project`,
          description: `Joint initiative focusing on ${tags[index % tags.length]} solutions`,
          startDate: getRandomPastDate(730),
          endDate: getRandomPastDate(365),
          outcome: Math.random() > 0.5 ? 'Successful project completion with positive outcomes' : 'Project completed with valuable learnings',
          successRating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
          createdBy: creator
        }
      ] : []
    };

    return contact;
  })
];
