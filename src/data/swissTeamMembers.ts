export interface SwissTeamMember {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  specialization: string[];
}

// Comprehensive list of Swiss team members with classical Swiss names
export const swissTeamMembers: SwissTeamMember[] = [
  // Senior Management
  {
    firstName: "Dr. Hans",
    lastName: "Zimmermann",
    email: "hans.zimmermann@kof.ethz.ch",
    department: "Management",
    role: "Director",
    specialization: ["strategic-planning", "international-relations", "policy-analysis"]
  },
  {
    firstName: "Prof. Elisabeth",
    lastName: "Weber",
    email: "elisabeth.weber@kof.ethz.ch",
    department: "Research",
    role: "Head of Research",
    specialization: ["macroeconomics", "forecasting", "policy-research"]
  },

  // Senior Research Team
  {
    firstName: "Dr. Andreas",
    lastName: "Müller",
    email: "andreas.mueller@kof.ethz.ch",
    department: "Research",
    role: "Senior Economist",
    specialization: ["monetary-policy", "banking", "financial-markets"]
  },
  {
    firstName: "Dr. Claudia",
    lastName: "Fischer",
    email: "claudia.fischer@kof.ethz.ch",
    department: "Research",
    role: "Senior Economist",
    specialization: ["labor-economics", "education", "social-policy"]
  },
  {
    firstName: "Dr. Thomas",
    lastName: "Huber",
    email: "thomas.huber@kof.ethz.ch",
    department: "Research",
    role: "Senior Economist",
    specialization: ["international-trade", "globalization", "emerging-markets"]
  },
  {
    firstName: "Dr. Margrit",
    lastName: "Baumgartner",
    email: "margrit.baumgartner@kof.ethz.ch",
    department: "Research",
    role: "Senior Economist",
    specialization: ["innovation", "technology", "entrepreneurship"]
  },

  // Research Associates
  {
    firstName: "Stefan",
    lastName: "Meier",
    email: "stefan.meier@kof.ethz.ch",
    department: "Research",
    role: "Research Associate",
    specialization: ["econometrics", "data-analysis", "forecasting"]
  },
  {
    firstName: "Nicole",
    lastName: "Graf",
    email: "nicole.graf@kof.ethz.ch",
    department: "Research",
    role: "Research Associate",
    specialization: ["business-cycles", "indicators", "surveys"]
  },
  {
    firstName: "Daniel",
    lastName: "Schneider",
    email: "daniel.schneider@kof.ethz.ch",
    department: "Research",
    role: "Research Associate",
    specialization: ["regional-economics", "urban-development", "housing"]
  },
  {
    firstName: "Sandra",
    lastName: "Keller",
    email: "sandra.keller@kof.ethz.ch",
    department: "Research",
    role: "Research Associate",
    specialization: ["energy-economics", "sustainability", "climate-policy"]
  },
  {
    firstName: "Markus",
    lastName: "Steiner",
    email: "markus.steiner@kof.ethz.ch",
    department: "Research",
    role: "Research Associate",
    specialization: ["corporate-finance", "investment", "capital-markets"]
  },

  // Data Services Team
  {
    firstName: "Beat",
    lastName: "Wyss",
    email: "beat.wyss@kof.ethz.ch",
    department: "Data Services",
    role: "Head of Data Services",
    specialization: ["data-management", "statistics", "database-systems"]
  },
  {
    firstName: "Petra",
    lastName: "Hofmann",
    email: "petra.hofmann@kof.ethz.ch",
    department: "Data Services",
    role: "Data Analyst",
    specialization: ["statistical-analysis", "data-visualization", "reporting"]
  },
  {
    firstName: "Lukas",
    lastName: "Brunner",
    email: "lukas.brunner@kof.ethz.ch",
    department: "Data Services",
    role: "Data Scientist",
    specialization: ["machine-learning", "big-data", "predictive-analytics"]
  },

  // Communications & Outreach
  {
    firstName: "Carmen",
    lastName: "Roth",
    email: "carmen.roth@kof.ethz.ch",
    department: "Communications",
    role: "Communications Manager",
    specialization: ["public-relations", "media", "stakeholder-engagement"]
  },
  {
    firstName: "Michael",
    lastName: "Baumann",
    email: "michael.baumann@kof.ethz.ch",
    department: "Communications",
    role: "Communications Specialist",
    specialization: ["content-creation", "digital-media", "events"]
  },

  // International Relations
  {
    firstName: "Dr. Simone",
    lastName: "Gerber",
    email: "simone.gerber@kof.ethz.ch",
    department: "International",
    role: "International Relations Manager",
    specialization: ["international-cooperation", "EU-relations", "multilateral-organizations"]
  },
  {
    firstName: "Patrick",
    lastName: "Lehmann",
    email: "patrick.lehmann@kof.ethz.ch",
    department: "International",
    role: "International Relations Specialist",
    specialization: ["development-economics", "emerging-markets", "trade-policy"]
  },

  // Administration & Operations
  {
    firstName: "Ursula",
    lastName: "Frei",
    email: "ursula.frei@kof.ethz.ch",
    department: "Administration",
    role: "Operations Manager",
    specialization: ["operations", "finance", "human-resources"]
  },
  {
    firstName: "Werner",
    lastName: "Schmid",
    email: "werner.schmid@kof.ethz.ch",
    department: "Administration",
    role: "IT Manager",
    specialization: ["information-technology", "systems", "security"]
  },

  // Junior Researchers
  {
    firstName: "Julia",
    lastName: "Widmer",
    email: "julia.widmer@kof.ethz.ch",
    department: "Research",
    role: "Junior Researcher",
    specialization: ["health-economics", "demographics", "social-security"]
  },
  {
    firstName: "Marco",
    lastName: "Vogel",
    email: "marco.vogel@kof.ethz.ch",
    department: "Research",
    role: "Junior Researcher",
    specialization: ["behavioral-economics", "consumer-behavior", "market-research"]
  }
];

// Helper functions
export const getTeamMemberFullName = (member: SwissTeamMember): string => {
  return `${member.firstName} ${member.lastName}`;
};

export const getTeamMembersByDepartment = (department: string): SwissTeamMember[] => {
  return swissTeamMembers.filter(member => member.department === department);
};

export const getTeamMembersBySpecialization = (specialization: string): SwissTeamMember[] => {
  return swissTeamMembers.filter(member => 
    member.specialization.includes(specialization)
  );
};

export const getRandomTeamMember = (): SwissTeamMember => {
  return swissTeamMembers[Math.floor(Math.random() * swissTeamMembers.length)];
};

export const assignContactToTeamMember = (
  contactTags: string[], 
  contactCompany?: string,
  contactPosition?: string
): SwissTeamMember => {
  // Smart assignment based on contact characteristics
  
  // Financial sector contacts
  if (contactTags.some(tag => ['finance', 'banking', 'fintech', 'investment'].includes(tag)) ||
      contactCompany?.toLowerCase().includes('bank') ||
      contactPosition?.toLowerCase().includes('financial')) {
    const financialExperts = getTeamMembersBySpecialization('monetary-policy')
      .concat(getTeamMembersBySpecialization('banking'))
      .concat(getTeamMembersBySpecialization('financial-markets'));
    if (financialExperts.length > 0) {
      return financialExperts[Math.floor(Math.random() * financialExperts.length)];
    }
  }

  // Tech and innovation contacts
  if (contactTags.some(tag => ['tech', 'AI', 'innovation', 'startup'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('tech')) {
    const innovationExperts = getTeamMembersBySpecialization('innovation')
      .concat(getTeamMembersBySpecialization('technology'));
    if (innovationExperts.length > 0) {
      return innovationExperts[Math.floor(Math.random() * innovationExperts.length)];
    }
  }

  // International contacts
  if (contactTags.some(tag => ['international', 'trade', 'global'].includes(tag)) ||
      contactCompany?.toLowerCase().includes('international')) {
    const internationalExperts = getTeamMembersBySpecialization('international-trade')
      .concat(getTeamMembersBySpecialization('international-cooperation'));
    if (internationalExperts.length > 0) {
      return internationalExperts[Math.floor(Math.random() * internationalExperts.length)];
    }
  }

  // Policy and government contacts
  if (contactTags.some(tag => ['policy', 'government', 'public'].includes(tag)) ||
      contactCompany?.toLowerCase().includes('government') ||
      contactCompany?.toLowerCase().includes('ministry')) {
    const policyExperts = getTeamMembersBySpecialization('policy-analysis')
      .concat(getTeamMembersBySpecialization('policy-research'));
    if (policyExperts.length > 0) {
      return policyExperts[Math.floor(Math.random() * policyExperts.length)];
    }
  }

  // Data and analytics contacts
  if (contactTags.some(tag => ['data', 'analytics', 'statistics'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('data')) {
    const dataExperts = getTeamMembersByDepartment('Data Services');
    if (dataExperts.length > 0) {
      return dataExperts[Math.floor(Math.random() * dataExperts.length)];
    }
  }

  // Default: assign to research team
  const researchTeam = getTeamMembersByDepartment('Research');
  return researchTeam[Math.floor(Math.random() * researchTeam.length)];
};