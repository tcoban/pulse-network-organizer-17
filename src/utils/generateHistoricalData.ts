import { supabase } from '@/integrations/supabase/client';

// Rich historical data generators
const generateInteractions = (contactName: string, contactCompany?: string) => {
  const interactions = [];
  const currentYear = new Date().getFullYear();
  
  // Generate 3-8 interactions per contact over past 2 years
  const numInteractions = Math.floor(Math.random() * 6) + 3;
  
  const interactionTypes = ['meeting', 'call', 'email', 'coffee', 'event', 'other'] as const;
  const channels = ['LinkedIn', 'Email', 'Phone', 'In-person', 'Video call', 'Conference'];
  const contactors = ['Dr. Sarah Mueller', 'Prof. Hans Gersbach', 'Dr. Michael Weber', 'Anna Schmidt', 'Thomas Bauer'];
  
  const interactionTemplates = [
    'Discussed potential collaboration on {topic}',
    'Follow-up meeting about {topic}',
    'Introduced to {person} from our team',
    'Presentation of our latest research on {topic}',
    'Coffee meeting to explore mutual interests',
    'Phone call regarding {topic}',
    'Email exchange about data sharing possibilities',
    'Informal discussion at {event}',
    'Consultation on methodology for {topic}',
    'Workshop attendance and networking'
  ];
  
  const topics = [
    'monetary policy analysis', 'economic forecasting', 'data collaboration', 'research methodology',
    'Swiss economic indicators', 'international trade', 'financial stability', 'digitalization impact',
    'sustainability metrics', 'policy evaluation', 'academic partnership', 'data sharing agreement'
  ];
  
  const events = ['KOF Economic Forum', 'SNB Conference', 'Economic Policy Workshop', 'Research Symposium'];
  const people = ['Prof. Jan-Egbert Sturm', 'Dr. Heiner Mikosch', 'Sarah Johnson', 'Michael Chen'];
  
  for (let i = 0; i < numInteractions; i++) {
    const daysAgo = Math.floor(Math.random() * 730) + 30; // 30-730 days ago
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const contactor = contactors[Math.floor(Math.random() * contactors.length)];
    
    let template = interactionTemplates[Math.floor(Math.random() * interactionTemplates.length)];
    let description = template
      .replace('{topic}', topics[Math.floor(Math.random() * topics.length)])
      .replace('{person}', people[Math.floor(Math.random() * people.length)])
      .replace('{event}', events[Math.floor(Math.random() * events.length)]);
    
    const outcomes = [
      'Agreed to share quarterly data',
      'Scheduled follow-up meeting',
      'Exchanged research papers',
      'Discussed potential joint publication',
      'Identified collaboration opportunities',
      'Established regular communication',
      'Connected to relevant team members',
      'Agreed to participate in our survey'
    ];
    
    const evaluations = [
      'Very productive, high potential for collaboration',
      'Good rapport established, open to future projects',
      'Informative exchange, moderate collaboration potential',
      'Positive meeting, willing to share insights',
      'Excellent connection, immediate collaboration possible',
      'Professional discussion, long-term potential',
      'Valuable input received, mutual benefit identified'
    ];
    
    interactions.push({
      type,
      date,
      description,
      outcome: Math.random() > 0.3 ? outcomes[Math.floor(Math.random() * outcomes.length)] : null,
      contacted_by: contactor,
      channel,
      evaluation: Math.random() > 0.2 ? evaluations[Math.floor(Math.random() * evaluations.length)] : null
    });
  }
  
  return interactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const generateEventParticipations = (contactName: string, contactCompany?: string) => {
  const events = [];
  const numEvents = Math.floor(Math.random() * 5) + 2; // 2-6 events
  
  const eventTemplates = [
    { name: 'KOF Economic Forecast Presentation', type: 'conference' },
    { name: 'Swiss Economic Forum', type: 'forum' },
    { name: 'Central Banking Workshop', type: 'workshop' },
    { name: 'Data Science in Economics Seminar', type: 'seminar' },
    { name: 'Economic Policy Roundtable', type: 'roundtable' },
    { name: 'Financial Stability Conference', type: 'conference' },
    { name: 'Academic Research Symposium', type: 'symposium' },
    { name: 'Digital Economy Workshop', type: 'workshop' },
    { name: 'Sustainability in Economics Panel', type: 'panel' },
    { name: 'International Trade Forum', type: 'forum' }
  ];
  
  const locations = ['ETH Zurich', 'University of Zurich', 'SNB Zurich', 'KOF ETH Zurich', 'SECO Bern', 'Virtual Event'];
  const participationTypes = ['speaker', 'attendee', 'panelist', 'organizer', 'keynote speaker'];
  
  for (let i = 0; i < numEvents; i++) {
    const daysAgo = Math.floor(Math.random() * 1095) + 30; // 30-1095 days ago (3 years)
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() - daysAgo);
    
    const eventTemplate = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const participationType = participationTypes[Math.floor(Math.random() * participationTypes.length)];
    
    const notes = [
      'Presented latest research findings',
      'Engaged in productive networking',
      'Participated in Q&A session',
      'Delivered keynote on economic trends',
      'Moderated panel discussion',
      'Attended breakout sessions',
      'Connected with international colleagues',
      'Shared insights on policy implications'
    ];
    
    events.push({
      event_name: eventTemplate.name,
      event_type: eventTemplate.type,
      event_date: eventDate,
      location,
      participation_type: participationType,
      notes: Math.random() > 0.3 ? notes[Math.floor(Math.random() * notes.length)] : null
    });
  }
  
  return events.sort((a, b) => b.event_date.getTime() - a.event_date.getTime());
};

const generateCollaborations = (contactName: string, contactCompany?: string) => {
  const collaborations = [];
  const numCollabs = Math.floor(Math.random() * 4) + 1; // 1-4 collaborations
  
  const projectTemplates = [
    'Swiss Economic Indicator Development',
    'Cross-Border Trade Analysis',
    'Monetary Policy Impact Study',
    'Digital Economy Measurement',
    'Sustainability Index Creation',
    'Financial Stability Assessment',
    'Regional Economic Forecasting',
    'Innovation Metrics Framework',
    'Labor Market Dynamics Study',
    'International Competitiveness Analysis'
  ];
  
  const descriptions = [
    'Joint research project analyzing economic indicators',
    'Collaborative data collection and analysis initiative',
    'Multi-institutional study on policy effectiveness',
    'Shared methodology development project',
    'Cross-sectoral economic impact assessment',
    'International comparative study',
    'Policy evaluation framework development',
    'Economic modeling collaboration'
  ];
  
  for (let i = 0; i < numCollabs; i++) {
    const startDaysAgo = Math.floor(Math.random() * 900) + 365; // 1-3 years ago
    const durationDays = Math.floor(Math.random() * 365) + 90; // 3-15 months duration
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDaysAgo);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    
    const projectName = projectTemplates[Math.floor(Math.random() * projectTemplates.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const outcomes = [
      'Published joint research paper',
      'Developed new economic indicators',
      'Created shared database',
      'Established ongoing data exchange',
      'Produced policy recommendations',
      'Built analytical framework',
      'Generated actionable insights',
      'Strengthened institutional relationship'
    ];
    
    const successRating = Math.floor(Math.random() * 3) + 3; // 3-5 rating
    
    collaborations.push({
      project_name: projectName,
      description,
      start_date: startDate,
      end_date: endDate,
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      success_rating: successRating,
      created_by: 'System'
    });
  }
  
  return collaborations.sort((a, b) => b.start_date.getTime() - a.start_date.getTime());
};

export const generateAndInsertHistoricalData = async () => {
  console.log('Starting historical data generation...');
  
  try {
    // Get all contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, company');
    
    if (contactsError) throw contactsError;
    if (!contacts || contacts.length === 0) {
      console.log('No contacts found');
      return;
    }
    
    console.log(`Generating historical data for ${contacts.length} contacts...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const contact of contacts) {
      try {
        console.log(`Processing ${contact.name}...`);
        
        // Generate historical data
        const interactions = generateInteractions(contact.name, contact.company);
        const events = generateEventParticipations(contact.name, contact.company);
        const collaborations = generateCollaborations(contact.name, contact.company);
        
        // Insert interactions
        for (const interaction of interactions) {
          const { error: interactionError } = await supabase
            .from('interactions')
            .insert({
              contact_id: contact.id,
              ...interaction
            });
          
          if (interactionError) {
            console.error(`Error inserting interaction for ${contact.name}:`, interactionError);
          }
        }
        
        // Insert event participations
        for (const event of events) {
          const { error: eventError } = await supabase
            .from('event_participations')
            .insert({
              contact_id: contact.id,
              ...event
            });
          
          if (eventError) {
            console.error(`Error inserting event for ${contact.name}:`, eventError);
          }
        }
        
        // Insert collaborations
        for (const collaboration of collaborations) {
          const { error: collabError } = await supabase
            .from('collaborations')
            .insert({
              contact_id: contact.id,
              ...collaboration
            });
          
          if (collabError) {
            console.error(`Error inserting collaboration for ${contact.name}:`, collabError);
          }
        }
        
        // Update last contact date for some contacts
        if (Math.random() > 0.3) {
          const recentInteraction = interactions[0];
          await supabase
            .from('contacts')
            .update({ last_contact: recentInteraction.date.toISOString() })
            .eq('id', contact.id);
        }
        
        successCount++;
        console.log(`✓ Generated data for ${contact.name}`);
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`Error processing ${contact.name}:`, err);
        errorCount++;
      }
    }
    
    console.log(`\nHistorical data generation completed!`);
    console.log(`Success: ${successCount} contacts`);
    console.log(`Errors: ${errorCount} contacts`);
    
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('Error in generateAndInsertHistoricalData:', error);
    throw error;
  }
};