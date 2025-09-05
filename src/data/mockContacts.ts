import { Contact, ContactOpportunity } from '@/types/contact';

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
    interactionHistory: []
  },
  // Adding 146 more diverse contacts to reach 150 total
  {
    id: '5',
    name: 'Dr. Lisa Müller',
    email: 'lisa.mueller@medtech.ch',
    phone: '+41 44 123 4567',
    company: 'Swiss MedTech AG',
    position: 'Chief Medical Officer',
    tags: ['healthcare', 'medical', 'research'],
    notes: 'Leading expert in digital health technologies. Pioneer in AI-assisted diagnostics.',
    lastContact: getRandomPastDate(120),
    addedDate: getRandomPastDate(150),
    socialLinks: { linkedin: 'https://linkedin.com/in/lisamueller' },
    referredBy: 'Conference Contact',
    linkedinConnections: ['Andreas Weber', 'Sarah Chen'],
    currentProjects: 'Developing AI-powered diagnostic platform for early cancer detection',
    mutualBenefit: 'Access to healthcare AI innovations and regulatory expertise',
    cooperationRating: 4,
    potentialScore: 5,
    affiliation: 'ETH Alumni',
    offering: 'Medical expertise, regulatory knowledge, healthcare partnerships',
    lookingFor: 'AI/ML technical partnerships, medical device certification support',
    upcomingOpportunities: [
      {
        id: 'opp-6',
        type: 'conference',
        title: 'Digital Health Summit',
        date: getRandomFutureDate(60),
        location: 'Basel Life Sciences Campus',
        description: 'Keynote on AI in medical diagnostics',
        registrationStatus: 'confirmed'
      }
    ],
    interactionHistory: [
      {
        id: '5',
        type: 'event',
        date: getRandomPastDate(120),
        description: 'Met at MedTech Innovation Conference',
        outcome: 'Exchanged business cards and discussed potential collaboration',
        contactedBy: 'John Smith',
        channel: 'In-person',
        evaluation: 'Highly knowledgeable, interested in AI applications'
      }
    ]
  },
  {
    id: '6',
    name: 'Andreas Weber',
    email: 'a.weber@globalmanufacturing.de',
    phone: '+49 89 123 4567',
    company: 'Global Manufacturing Solutions',
    position: 'Head of Digital Transformation',
    tags: ['manufacturing', 'digital-transformation', 'industry-4.0'],
    notes: 'Spearheading Industry 4.0 initiatives across European manufacturing facilities.',
    lastContact: getRandomPastDate(30),
    addedDate: getRandomPastDate(90),
    socialLinks: { linkedin: 'https://linkedin.com/in/andreasweber' },
    referredBy: 'Trade Show Contact',
    linkedinConnections: ['Dr. Lisa Müller', 'Thomas Schmidt'],
    currentProjects: 'Implementing IoT and AI across 15 manufacturing plants in Europe',
    mutualBenefit: 'Manufacturing digitalization expertise and enterprise implementation experience',
    cooperationRating: 3,
    potentialScore: 4,
    affiliation: 'Trade Association Member',
    offering: 'Manufacturing expertise, digital transformation experience, European market access',
    lookingFor: 'IoT solutions, predictive maintenance technologies, supply chain optimization',
    upcomingOpportunities: [
      {
        id: 'opp-7',
        type: 'event',
        title: 'Industry 4.0 Workshop',
        date: getRandomFutureDate(45),
        location: 'Munich Technology Center',
        description: 'Leading workshop on digital transformation best practices',
        registrationStatus: 'confirmed'
      }
    ],
    interactionHistory: [
      {
        id: '6',
        type: 'meeting',
        date: getRandomPastDate(30),
        description: 'Strategy discussion on manufacturing digitalization',
        outcome: 'Agreed to pilot program for predictive maintenance solution',
        contactedBy: 'Maria Garcia',
        channel: 'Video Call',
        evaluation: 'Excellent meeting, moving forward with pilot project'
      }
    ]
  },
  {
    id: '7',
    name: 'Jennifer Chang',
    email: 'jennifer@retailtech.com',
    phone: '+1 (415) 555-0123',
    company: 'RetailTech Innovations',
    position: 'VP of Customer Experience',
    tags: ['retail', 'customer-experience', 'e-commerce'],
    notes: 'Expert in omnichannel retail experiences and customer analytics.',
    lastContact: getRandomPastDate(95),
    addedDate: getRandomPastDate(120),
    socialLinks: { linkedin: 'https://linkedin.com/in/jenniferchang', twitter: 'https://twitter.com/jchang_retail' },
    referredBy: 'Industry Contact',
    linkedinConnections: ['Michael Brown', 'Sarah Chen'],
    currentProjects: 'Launching AI-powered personalization engine for omnichannel retail',
    mutualBenefit: 'Retail industry insights and customer behavior analytics expertise',
    cooperationRating: 3,
    potentialScore: 3,
    affiliation: 'Retail Innovation Network',
    offering: 'Retail expertise, customer analytics, omnichannel strategy',
    lookingFor: 'AI personalization technologies, data analytics solutions, payment innovations',
    upcomingOpportunities: [],
    interactionHistory: [
      {
        id: '7',
        type: 'email',
        date: getRandomPastDate(95),
        description: 'Discussion about retail analytics collaboration',
        outcome: 'Interested in learning more about our data solutions',
        contactedBy: 'Alex Thompson',
        channel: 'Email',
        evaluation: 'Positive response, need to follow up with technical details'
      }
    ]
  },
  {
    id: '8',
    name: 'Roberto Silva',
    email: 'roberto@financeplus.br',
    phone: '+55 11 9876 5432',
    company: 'Finance Plus Brasil',
    position: 'Director of Innovation',
    tags: ['fintech', 'latin-america', 'payments'],
    notes: 'Leading fintech innovation in Latin American markets, especially payment solutions.',
    lastContact: getRandomPastDate(110),
    addedDate: getRandomPastDate(140),
    socialLinks: { linkedin: 'https://linkedin.com/in/robertosilva' },
    referredBy: 'Marcus Rodriguez',
    linkedinConnections: ['Carlos Martinez', 'Ana Santos'],
    currentProjects: 'Expanding digital payment solutions across 5 Latin American countries',
    mutualBenefit: 'Latin American market access and fintech regulatory expertise',
    cooperationRating: 4,
    potentialScore: 4,
    affiliation: 'LatAm Fintech Association',
    offering: 'Latin American market expertise, fintech solutions, regulatory compliance',
    lookingFor: 'Payment infrastructure, fraud detection technologies, international partnerships',
    upcomingOpportunities: [
      {
        id: 'opp-8',
        type: 'conference',
        title: 'LatAm Fintech Summit',
        date: getRandomFutureDate(75),
        location: 'São Paulo Convention Center',
        description: 'Panel on cross-border payment innovations',
        registrationStatus: 'confirmed'
      }
    ],
    interactionHistory: [
      {
        id: '8',
        type: 'call',
        date: getRandomPastDate(110),
        description: 'Initial discussion about Latin American expansion',
        outcome: 'Shared market insights and discussed potential partnerships',
        contactedBy: 'John Smith',
        channel: 'Phone',
        evaluation: 'Very knowledgeable about LatAm markets, high cooperation potential'
      }
    ]
  },
  // Continue with remaining contacts...
  ...Array.from({ length: 142 }, (_, index) => {
    const id = (index + 9).toString();
    const names = [
      'Yuki Tanaka', 'Sophie Dubois', 'Michael O\'Brien', 'Priya Patel', 'Thomas Schmidt', 'Isabella Rossi',
      'Ahmed Al-Rashid', 'Emma Thompson', 'Lars Andersen', 'Maria Santos', 'Viktor Petrov', 'Rachel Green',
      'Hendrik van der Berg', 'Chen Wei', 'Olumide Adebayo', 'Astrid Nielsen', 'François Dubois', 'James Mitchell',
      'Fatima Al-Zahra', 'Erik Johansson', 'Claudia Romano', 'Dmitri Volkov', 'Ananya Sharma', 'Pedro Gonzalez',
      'Ingrid Larsen', 'Kenji Nakamura', 'Beatrice Müller', 'Omar Hassan', 'Lucia Fernandez', 'Raj Gupta',
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
      'CEO', 'CTO', 'VP of Engineering', 'Director of Innovation', 'Head of Product',
      'Chief Data Officer', 'VP of Technology', 'Innovation Manager', 'Tech Lead',
      'Product Manager', 'Engineering Director', 'Chief Technology Officer',
      'Head of Digital Transformation', 'VP of Data Science', 'Innovation Director',
      'Technology Manager', 'Digital Strategy Director', 'Head of AI/ML',
      'VP of Product Development', 'Chief Innovation Officer'
    ];
    
    const tagOptions = [
      ['AI', 'machine-learning', 'tech'], ['fintech', 'payments', 'finance'], ['healthcare', 'medtech', 'digital-health'],
      ['manufacturing', 'industry-4.0', 'IoT'], ['retail', 'e-commerce', 'customer-experience'],
      ['education', 'edtech', 'digital-learning'], ['energy', 'cleantech', 'sustainability'],
      ['automotive', 'mobility', 'autonomous-systems'], ['cybersecurity', 'data-protection', 'security'],
      ['blockchain', 'crypto', 'web3'], ['gaming', 'VR', 'entertainment'], ['logistics', 'supply-chain', 'transportation'],
      ['real-estate', 'proptech', 'smart-buildings'], ['insurance', 'insurtech', 'risk-management'],
      ['agriculture', 'agtech', 'farming'], ['aerospace', 'space-tech', 'satellites'],
      ['biotech', 'pharma', 'life-sciences'], ['legal', 'legaltech', 'compliance'],
      ['marketing', 'adtech', 'digital-marketing'], ['HR', 'talent', 'workforce-management']
    ];
    
    const affiliations = [
      'ETH Alumni', 'KOF Alumni', 'Dataservice Customer', 'CIRET Member', 'Survey Participant Contact',
      'Conference Contact', 'LinkedIn Connection', 'Industry Association Member', 'Trade Show Contact',
      'Research Collaboration Partner', 'University Connection', 'Professional Network',
      'Industry Expert', 'Advisory Board Member', 'Strategic Partner'
    ];

    const name = names[index % names.length];
    const company = companies[index % companies.length];
    const position = positions[index % positions.length];
    const tags = tagOptions[index % tagOptions.length];
    const affiliation = affiliations[index % affiliations.length];
    
    return {
      id,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+${Math.floor(Math.random() * 50) + 1} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      company,
      position,
      tags,
      notes: `Professional contact with expertise in ${tags.join(', ')}. Potential collaboration opportunities identified.`,
      lastContact: Math.random() > 0.3 ? getRandomPastDate(200) : undefined,
      addedDate: getRandomPastDate(365),
      socialLinks: { linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/[^a-z]/g, '')}` },
      referredBy: Math.random() > 0.5 ? names[Math.floor(Math.random() * names.length)] : 'Direct Contact',
      linkedinConnections: [names[Math.floor(Math.random() * names.length)], names[Math.floor(Math.random() * names.length)]],
      currentProjects: `Leading ${tags[0]} initiatives and digital transformation projects`,
      mutualBenefit: `Access to ${tags[0]} expertise and industry connections`,
      cooperationRating: Math.floor(Math.random() * 5) + 1,
      potentialScore: Math.floor(Math.random() * 5) + 1,
      affiliation,
      offering: `${tags[0]} expertise, industry knowledge, strategic partnerships`,
      lookingFor: `Technology solutions, partnerships, market expansion opportunities`,
      upcomingOpportunities: Math.random() > 0.6 ? [
        {
          id: `opp-${id}`,
          type: Math.random() > 0.5 ? 'conference' : 'meeting',
          title: Math.random() > 0.5 ? `${tags[0]} Summit` : 'Strategic Planning Meeting',
          date: getRandomFutureDate(90),
          location: 'TBD',
          description: `Industry event focused on ${tags[0]} innovations`,
          registrationStatus: Math.random() > 0.3 ? 'confirmed' : 'registered'
        }
      ] : [],
      interactionHistory: Math.random() > 0.4 ? [
        {
          id: `int-${id}`,
          type: Math.random() > 0.5 ? 'email' : 'call',
          date: getRandomPastDate(200),
          description: `Discussion about ${tags[0]} collaboration opportunities`,
          outcome: Math.random() > 0.5 ? 'Positive response, follow-up scheduled' : 'Exploring partnership opportunities',
          contactedBy: Math.random() > 0.5 ? 'John Smith' : 'Maria Garcia',
          channel: Math.random() > 0.5 ? 'Email' : 'Phone',
          evaluation: 'Good potential for collaboration'
        }
      ] : []
    } as Contact;
  })
];