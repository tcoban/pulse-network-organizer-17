import { Contact } from '@/types/contact';

export const generateSyntheticContacts = (): Omit<Contact, 'id' | 'addedDate' | 'interactionHistory' | 'upcomingOpportunities'>[] => {
  const contacts = [
    // Swiss National Bank & Federal Authorities
    {
      name: "Dr. Andrea Weber",
      email: "andrea.weber@snb.ch",
      phone: "+41 44 631 31 11",
      company: "Swiss National Bank",
      position: "Senior Economist, Monetary Policy",
      avatar: "",
      tags: ["monetary-policy", "central-banking", "swiss-economy"],
      notes: "Expert in monetary policy transmission mechanisms. Regular speaker at SNB conferences.",
      socialLinks: { linkedin: "https://linkedin.com/in/andrea-weber-snb" },
      customFields: {},
      referredBy: "Prof. Ernst Baltensperger",
      linkedinConnections: [],
      currentProjects: "Digital franc feasibility study",
      mutualBenefit: "SNB insights on monetary policy implementation",
      cooperationRating: 9,
      potentialScore: 10,
      affiliation: "Swiss National Bank",
      offering: "Central bank policy insights, macro data",
      lookingFor: "Academic research on cryptocurrency impact",
      assignedTo: "team",
      createdBy: "team",
      preferences: {
        language: "German",
        preferredChannel: "email" as const,
        availableTimes: "Weekdays 9-17",
        meetingLocation: "Zurich"
      }
    },
    {
      name: "Prof. Thomas Zimmermann",
      email: "thomas.zimmermann@seco.admin.ch",
      phone: "+41 58 462 56 56",
      company: "State Secretariat for Economic Affairs (SECO)",
      position: "Head of Macroeconomic Analysis",
      avatar: "",
      tags: ["fiscal-policy", "macroeconomics", "swiss-government"],
      notes: "Leading government economist. Key contact for fiscal policy research collaboration.",
      socialLinks: { linkedin: "https://linkedin.com/in/thomas-zimmermann-seco" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "COVID-19 economic recovery analysis",
      mutualBenefit: "Government economic data access",
      cooperationRating: 8,
      potentialScore: 9,
      affiliation: "Swiss Federal Government",
      offering: "Government economic perspectives, policy data",
      lookingFor: "Economic modeling expertise",
      assignedTo: "team",
      createdBy: "team"
    },

    // International Organizations
    {
      name: "Dr. Maria Rodriguez",
      email: "m.rodriguez@imf.org",
      phone: "+1 202 623 7000",
      company: "International Monetary Fund",
      position: "Senior Economist, European Department",
      avatar: "",
      tags: ["international-economics", "IMF", "european-economy"],
      notes: "IMF mission chief for Switzerland. Expert in international monetary systems.",
      socialLinks: { linkedin: "https://linkedin.com/in/maria-rodriguez-imf" },
      customFields: {},
      referredBy: "Dr. Andrea Weber",
      linkedinConnections: [],
      currentProjects: "Article IV consultation Switzerland 2024",
      mutualBenefit: "IMF research collaboration opportunities",
      cooperationRating: 7,
      potentialScore: 9,
      affiliation: "International Monetary Fund",
      offering: "International perspective, cross-country data",
      lookingFor: "Swiss economic research, local insights",
      assignedTo: "team",
      createdBy: "team"
    },
    {
      name: "Prof. Jean-Claude Trichet",
      email: "jean-claude.trichet@oecd.org",
      phone: "+33 1 45 24 82 00",
      company: "OECD",
      position: "Senior Advisor, Economics Department",
      avatar: "",
      tags: ["OECD", "monetary-policy", "european-integration"],
      notes: "Former ECB President. Now OECD senior advisor. Influential voice in European monetary policy.",
      socialLinks: { linkedin: "https://linkedin.com/in/jc-trichet-oecd" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Digital currencies policy framework",
      mutualBenefit: "OECD platform for research dissemination",
      cooperationRating: 6,
      potentialScore: 8,
      affiliation: "OECD",
      offering: "Policy frameworks, international best practices",
      lookingFor: "Academic expertise on digital finance",
      assignedTo: "team",
      createdBy: "team"
    },

    // Academic Institutions - International
    {
      name: "Prof. Carmen Reinhart",
      email: "creinhart@hks.harvard.edu",
      phone: "+1 617 495 1155",
      company: "Harvard Kennedy School",
      position: "Minos A. Zombanakis Professor of the International Financial System",
      avatar: "",
      tags: ["financial-crises", "sovereign-debt", "harvard"],
      notes: "World-renowned expert on financial crises and sovereign debt. Former World Bank Chief Economist.",
      socialLinks: { linkedin: "https://linkedin.com/in/carmen-reinhart-harvard" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "This Time is Different - Updated Analysis",
      mutualBenefit: "Joint research on financial stability",
      cooperationRating: 5,
      potentialScore: 10,
      affiliation: "Harvard University",
      offering: "Financial crisis expertise, historical data",
      lookingFor: "European financial stability research",
      assignedTo: "team",
      createdBy: "team"
    },
    {
      name: "Prof. Kenneth Rogoff",
      email: "krogoff@harvard.edu",
      phone: "+1 617 495 4511",
      company: "Harvard University",
      position: "Thomas D. Cabot Professor of Public Policy",
      avatar: "",
      tags: ["international-economics", "exchange-rates", "harvard"],
      notes: "Former IMF Chief Economist. Expert in international economics and exchange rates.",
      socialLinks: { linkedin: "https://linkedin.com/in/kenneth-rogoff" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Cash and the COVID-19 pandemic",
      mutualBenefit: "Collaboration on international monetary issues",
      cooperationRating: 4,
      potentialScore: 9,
      affiliation: "Harvard University",
      offering: "International macro expertise",
      lookingFor: "Swiss monetary policy insights",
      assignedTo: "team",
      createdBy: "team"
    },

    // Swiss Universities
    {
      name: "Prof. Beatrice Weder di Mauro",
      email: "beatrice.wederdimauro@econ.uzh.ch",
      phone: "+41 44 634 37 28",
      company: "University of Zurich",
      position: "Professor of International and Monetary Economics",
      avatar: "",
      tags: ["UZH", "international-economics", "financial-stability"],
      notes: "Former German Council of Economic Experts member. Expert in international finance.",
      socialLinks: { linkedin: "https://linkedin.com/in/beatrice-weder-di-mauro" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "European banking union assessment",
      mutualBenefit: "Cross-university research collaboration",
      cooperationRating: 9,
      potentialScore: 9,
      affiliation: "University of Zurich",
      offering: "International banking expertise",
      lookingFor: "Swiss financial sector analysis",
      assignedTo: "team",
      createdBy: "team"
    },
    {
      name: "Prof. Michel Habib",
      email: "michel.habib@graduateinstitute.ch",
      phone: "+41 22 908 57 00",
      company: "Graduate Institute Geneva",
      position: "Professor of International Economics",
      avatar: "",
      tags: ["IHEID", "development-economics", "trade"],
      notes: "Expert in development economics and international trade. Strong networks in emerging markets.",
      socialLinks: { linkedin: "https://linkedin.com/in/michel-habib-geneva" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Trade and development in sub-Saharan Africa",
      mutualBenefit: "Development economics collaboration",
      cooperationRating: 7,
      potentialScore: 8,
      affiliation: "Graduate Institute Geneva",
      offering: "Development economics insights",
      lookingFor: "Quantitative methods expertise",
      assignedTo: "team",
      createdBy: "team"
    },

    // Financial Sector
    {
      name: "Dr. Sarah Mueller",
      email: "sarah.mueller@ubs.com",
      phone: "+41 44 234 11 11",
      company: "UBS",
      position: "Chief Economist Switzerland",
      avatar: "",
      tags: ["UBS", "banking", "swiss-economy"],
      notes: "Leading bank economist. Regular media commentator on Swiss economic developments.",
      socialLinks: { linkedin: "https://linkedin.com/in/sarah-mueller-ubs" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Swiss real estate market analysis",
      mutualBenefit: "Industry insights and data sharing",
      cooperationRating: 8,
      potentialScore: 8,
      affiliation: "UBS",
      offering: "Banking sector insights, market data",
      lookingFor: "Academic economic forecasting methods",
      assignedTo: "team",
      createdBy: "team"
    },
    {
      name: "Dr. Marco Huwiler",
      email: "marco.huwiler@credit-suisse.com",
      phone: "+41 44 333 11 11",
      company: "Credit Suisse",
      position: "Senior Economist",
      avatar: "",
      tags: ["credit-suisse", "banking", "wealth-management"],
      notes: "Specialist in wealth management and private banking economics.",
      socialLinks: { linkedin: "https://linkedin.com/in/marco-huwiler-cs" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Wealth inequality trends in Switzerland",
      mutualBenefit: "Private banking sector insights",
      cooperationRating: 7,
      potentialScore: 7,
      affiliation: "Credit Suisse",
      offering: "Wealth management data",
      lookingFor: "Academic research on inequality",
      assignedTo: "team",
      createdBy: "team"
    },

    // Think Tanks & Research Institutes
    {
      name: "Dr. Alexandra Janssen",
      email: "a.janssen@avenir-suisse.ch",
      phone: "+41 44 445 90 00",
      company: "Avenir Suisse",
      position: "Senior Research Fellow",
      avatar: "",
      tags: ["think-tank", "economic-policy", "switzerland"],
      notes: "Liberal think tank researcher. Focus on economic policy and structural reforms.",
      socialLinks: { linkedin: "https://linkedin.com/in/alexandra-janssen-avenir" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Digital transformation of Swiss economy",
      mutualBenefit: "Policy research collaboration",
      cooperationRating: 8,
      potentialScore: 8,
      affiliation: "Avenir Suisse",
      offering: "Policy analysis, reform proposals",
      lookingFor: "Empirical economic research",
      assignedTo: "team",
      createdBy: "team"
    },
    {
      name: "Prof. Daniel Lampart",
      email: "daniel.lampart@sgb.ch",
      phone: "+41 31 377 01 01",
      company: "Swiss Trade Union Federation",
      position: "Chief Economist",
      avatar: "",
      tags: ["labor-economics", "trade-unions", "social-policy"],
      notes: "Leading voice on labor economics and social policy in Switzerland.",
      socialLinks: { linkedin: "https://linkedin.com/in/daniel-lampart-sgb" },
      customFields: {},
      referredBy: "",
      linkedinConnections: [],
      currentProjects: "Impact of automation on Swiss labor market",
      mutualBenefit: "Labor market research insights",
      cooperationRating: 6,
      potentialScore: 7,
      affiliation: "Swiss Trade Union Federation",
      offering: "Labor market insights",
      lookingFor: "Academic labor economics research",
      assignedTo: "team",
      createdBy: "team"
    }
  ];

  // Generate additional contacts to reach 150
  const additionalContacts = generateAdditionalContacts(contacts.length);
  
  return [...contacts, ...additionalContacts];
};

const generateAdditionalContacts = (startingNumber: number): Omit<Contact, 'id' | 'addedDate' | 'interactionHistory' | 'upcomingOpportunities'>[] => {
  const companies = [
    "ETH Zurich", "University of Basel", "University of St. Gallen", "EPFL",
    "Swiss Re", "Zurich Insurance", "Roche", "Novartis", "Nestlé",
    "European Central Bank", "Bank of England", "Federal Reserve",
    "MIT", "Stanford", "LSE", "Oxford", "Cambridge", "Sciences Po",
    "McKinsey & Company", "Boston Consulting Group", "Deloitte",
    "Financial Times", "The Economist", "Bloomberg", "Reuters",
    "World Bank", "European Investment Bank", "BIS", "ECB"
  ];

  const positions = [
    "Professor of Economics", "Senior Economist", "Research Fellow", "Director",
    "Chief Economist", "Principal Economist", "Associate Professor", "Lecturer",
    "Senior Researcher", "Policy Analyst", "Managing Director", "Partner",
    "Economic Correspondent", "Editor", "Analyst", "Consultant"
  ];

  const firstNames = [
    "Andreas", "Barbara", "Christian", "Diana", "Erik", "Franziska", "Georg", "Helena",
    "Ivan", "Julia", "Klaus", "Laura", "Michael", "Nina", "Oliver", "Petra",
    "Robert", "Sabine", "Thomas", "Ursula", "Viktor", "Werner", "Yvonne", "Zora",
    "Alessandro", "Bianca", "Carlos", "Daniela", "Elena", "Francesco", "Giovanni",
    "Hans", "Isabella", "Jean", "Karl", "Lisa", "Martin", "Nicole", "Paolo"
  ];

  const lastNames = [
    "Müller", "Schmidt", "Weber", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch",
    "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann",
    "Braun", "Krüger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner",
    "Schmitz", "Krause", "Meier", "Lehmann", "Huber", "Mayer", "Herrmann",
    "König", "Walter", "Schulze", "Böhm", "Peters", "Hahn", "Janssen", "Kaiser"
  ];

  const tags = [
    ["macroeconomics", "monetary-policy"], ["financial-markets", "banking"],
    ["international-trade", "globalization"], ["labor-economics", "employment"],
    ["public-finance", "taxation"], ["development-economics", "emerging-markets"],
    ["econometrics", "data-science"], ["behavioral-economics", "psychology"],
    ["environmental-economics", "sustainability"], ["digital-economics", "fintech"],
    ["health-economics", "demographics"], ["urban-economics", "housing"],
    ["innovation", "entrepreneurship"], ["risk-management", "insurance"],
    ["pension-systems", "social-security"], ["competition-policy", "regulation"]
  ];

  const offerings = [
    "Quantitative analysis expertise", "Econometric modeling", "Policy insights",
    "Market data access", "Research collaboration", "Academic networks",
    "Industry connections", "Regulatory expertise", "International perspective",
    "Historical data", "Forecasting models", "Risk assessment methods"
  ];

  const lookingFor = [
    "Research partnerships", "Data sharing opportunities", "Academic collaboration",
    "Policy guidance", "Market insights", "Methodological expertise",
    "International networks", "Funding opportunities", "Publication venues",
    "Conference speakers", "Advisory roles", "Consulting projects"
  ];

  const additionalContacts = [];
  const targetCount = 150 - startingNumber;

  for (let i = 0; i < targetCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const randomTags = tags[Math.floor(Math.random() * tags.length)];
    const offering = offerings[Math.floor(Math.random() * offerings.length)];
    const seeking = lookingFor[Math.floor(Math.random() * lookingFor.length)];

    const contact = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '').replace(/&/g, '')}.com`,
      phone: `+41 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
      company,
      position,
      avatar: "",
      tags: randomTags,
      notes: `Expert in ${randomTags.join(' and ')}. ${Math.random() > 0.5 ? 'Frequent conference speaker.' : 'Active researcher in the field.'}`,
      socialLinks: { 
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${company.toLowerCase().replace(/\s+/g, '')}` 
      },
      customFields: {},
      referredBy: Math.random() > 0.7 ? "Conference contact" : "",
      linkedinConnections: [],
      currentProjects: `Research project on ${randomTags[0]}`,
      mutualBenefit: `${randomTags[0]} expertise sharing`,
      cooperationRating: Math.floor(Math.random() * 6) + 3, // 3-8
      potentialScore: Math.floor(Math.random() * 6) + 3, // 3-8
      affiliation: company,
      offering,
      lookingFor: seeking,
      assignedTo: "team",
      createdBy: "team",
      preferences: Math.random() > 0.5 ? {
        language: Math.random() > 0.5 ? "English" : "German",
        preferredChannel: (Math.random() > 0.5 ? "email" : "phone") as "email" | "phone",
        availableTimes: "Weekdays 9-17",
        meetingLocation: Math.random() > 0.5 ? "Zurich" : "Geneva"
      } : undefined
    };

    additionalContacts.push(contact);
  }

  return additionalContacts;
};