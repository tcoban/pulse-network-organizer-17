import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/hooks/useTeamMembers';

interface ContactAssignment {
  contactId: string;
  contactName: string;
  contactEmail: string;
  assignedToId: string;
  assignedToName: string;
  reason: string;
}

/**
 * Smart assignment of contacts to team members based on expertise matching
 */
export const assignContactToTeamMember = (
  contactTags: string[], 
  contactCompany?: string,
  contactPosition?: string,
  teamMembers?: TeamMember[]
): TeamMember | null => {
  if (!teamMembers || teamMembers.length === 0) return null;

  // Helper function to find team members by specialization
  const findBySpecialization = (specializations: string[]): TeamMember[] => {
    return teamMembers.filter(member => 
      member.specializations.some(spec => 
        specializations.includes(spec)
      )
    );
  };

  // Financial sector contacts
  if (contactTags.some(tag => ['finance', 'banking', 'fintech', 'investment', 'monetary'].includes(tag)) ||
      contactCompany?.toLowerCase().includes('bank') ||
      contactPosition?.toLowerCase().includes('financial')) {
    
    const financialExperts = findBySpecialization([
      'monetary-policy', 'banking', 'financial-markets', 'corporate-finance', 'investment'
    ]);
    
    if (financialExperts.length > 0) {
      return financialExperts[Math.floor(Math.random() * financialExperts.length)];
    }
  }

  // Tech and innovation contacts
  if (contactTags.some(tag => ['tech', 'AI', 'innovation', 'startup', 'technology'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('tech') ||
      contactCompany?.toLowerCase().includes('tech')) {
    
    const techExperts = findBySpecialization([
      'innovation', 'technology', 'entrepreneurship', 'machine-learning', 'information-technology'
    ]);
    
    if (techExperts.length > 0) {
      return techExperts[Math.floor(Math.random() * techExperts.length)];
    }
  }

  // International/Trade contacts
  if (contactTags.some(tag => ['international', 'trade', 'global', 'EU', 'export'].includes(tag)) ||
      contactCompany?.toLowerCase().includes('international') ||
      contactPosition?.toLowerCase().includes('international')) {
    
    const internationalExperts = findBySpecialization([
      'international-trade', 'international-cooperation', 'EU-relations', 'globalization', 'emerging-markets'
    ]);
    
    if (internationalExperts.length > 0) {
      return internationalExperts[Math.floor(Math.random() * internationalExperts.length)];
    }
  }

  // Policy and government contacts
  if (contactTags.some(tag => ['policy', 'government', 'public', 'regulation'].includes(tag)) ||
      contactCompany?.toLowerCase().includes('government') ||
      contactCompany?.toLowerCase().includes('ministry') ||
      contactPosition?.toLowerCase().includes('policy')) {
    
    const policyExperts = findBySpecialization([
      'policy-analysis', 'policy-research', 'strategic-planning'
    ]);
    
    if (policyExperts.length > 0) {
      return policyExperts[Math.floor(Math.random() * policyExperts.length)];
    }
  }

  // Data and analytics contacts
  if (contactTags.some(tag => ['data', 'analytics', 'statistics', 'research'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('data') ||
      contactPosition?.toLowerCase().includes('analyst')) {
    
    const dataExperts = findBySpecialization([
      'data-management', 'data-analysis', 'statistical-analysis', 'econometrics', 'machine-learning'
    ]);
    
    if (dataExperts.length > 0) {
      return dataExperts[Math.floor(Math.random() * dataExperts.length)];
    }
  }

  // Labor and social policy contacts
  if (contactTags.some(tag => ['labor', 'employment', 'social', 'education', 'health'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('hr') ||
      contactPosition?.toLowerCase().includes('social')) {
    
    const socialExperts = findBySpecialization([
      'labor-economics', 'education', 'social-policy', 'health-economics', 'demographics'
    ]);
    
    if (socialExperts.length > 0) {
      return socialExperts[Math.floor(Math.random() * socialExperts.length)];
    }
  }

  // Energy and sustainability contacts
  if (contactTags.some(tag => ['energy', 'sustainability', 'climate', 'environment'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('sustain') ||
      contactPosition?.toLowerCase().includes('energy')) {
    
    const energyExperts = findBySpecialization([
      'energy-economics', 'sustainability', 'climate-policy'
    ]);
    
    if (energyExperts.length > 0) {
      return energyExperts[Math.floor(Math.random() * energyExperts.length)];
    }
  }

  // Media and communications contacts
  if (contactTags.some(tag => ['media', 'communication', 'pr', 'marketing'].includes(tag)) ||
      contactPosition?.toLowerCase().includes('communication') ||
      contactPosition?.toLowerCase().includes('media')) {
    
    const commExperts = findBySpecialization([
      'public-relations', 'media', 'content-creation', 'digital-media'
    ]);
    
    if (commExperts.length > 0) {
      return commExperts[Math.floor(Math.random() * commExperts.length)];
    }
  }

  // Default: assign to general research team
  const researchTeam = teamMembers.filter(m => 
    m.department === 'Research' && 
    m.role.includes('Research Associate')
  );
  
  if (researchTeam.length > 0) {
    return researchTeam[Math.floor(Math.random() * researchTeam.length)];
  }

  // Ultimate fallback: any team member
  return teamMembers[Math.floor(Math.random() * teamMembers.length)];
};

/**
 * Assigns all contacts to team members based on smart matching
 */
export const assignAllContactsToTeamMembers = async (): Promise<{
  success: boolean;
  assignments: ContactAssignment[];
  errors: string[];
}> => {
  try {
    console.log('Starting contact assignment process...');
    
    // Get all team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true);

    if (teamError) {
      throw teamError;
    }

    if (!teamMembers || teamMembers.length === 0) {
      throw new Error('No team members found');
    }

    const transformedTeamMembers: TeamMember[] = teamMembers.map(member => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      department: member.department,
      role: member.role,
      specializations: member.specializations || [],
      bio: member.bio
    }));

    console.log(`Found ${transformedTeamMembers.length} team members`);

    // Get all contacts that need assignment
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        id, 
        name, 
        email, 
        company, 
        position, 
        assigned_to,
        contact_tags (tag)
      `);

    if (contactsError) {
      throw contactsError;
    }

    if (!contacts || contacts.length === 0) {
      return {
        success: true,
        assignments: [],
        errors: ['No contacts found to assign']
      };
    }

    console.log(`Found ${contacts.length} contacts to process`);

    const assignments: ContactAssignment[] = [];
    const errors: string[] = [];
    const updates: Array<{ id: string; assigned_to: string }> = [];

    // Process each contact
    for (const contact of contacts) {
      try {
        // Extract tags
        const tags = contact.contact_tags?.map((tag: any) => tag.tag) || [];
        
        // Smart assignment
        const assignedTeamMember = assignContactToTeamMember(
          tags,
          contact.company,
          contact.position,
          transformedTeamMembers
        );

        if (assignedTeamMember) {
          const assignmentReason = getAssignmentReason(tags, contact.company, contact.position);

          assignments.push({
            contactId: contact.id,
            contactName: contact.name,
            contactEmail: contact.email,
            assignedToId: assignedTeamMember.id,
            assignedToName: assignedTeamMember.name,
            reason: assignmentReason
          });

          updates.push({
            id: contact.id,
            assigned_to: assignedTeamMember.id
          });
        } else {
          errors.push(`Could not assign contact: ${contact.name} (${contact.email})`);
        }

      } catch (error) {
        const errorMsg = `Error processing contact ${contact.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Batch update contacts with assignments
    console.log(`Updating ${updates.length} contact assignments...`);
    
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ assigned_to: update.assigned_to })
        .eq('id', update.id);

      if (updateError) {
        errors.push(`Failed to update contact ${update.id}: ${updateError.message}`);
      }
    }

    console.log(`Contact assignment completed. Successful: ${assignments.length}, Errors: ${errors.length}`);
    
    return {
      success: true,
      assignments,
      errors
    };

  } catch (error) {
    console.error('Error in assignAllContactsToTeamMembers:', error);
    return {
      success: false,
      assignments: [],
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
};

/**
 * Gets assignment reason based on contact characteristics
 */
const getAssignmentReason = (tags: string[], company?: string, position?: string): string => {
  if (tags.some(tag => ['finance', 'banking', 'fintech'].includes(tag))) return 'Financial expertise match';
  if (tags.some(tag => ['tech', 'AI', 'innovation'].includes(tag))) return 'Technology expertise match';
  if (tags.some(tag => ['international', 'trade', 'global'].includes(tag))) return 'International expertise match';
  if (tags.some(tag => ['policy', 'government'].includes(tag))) return 'Policy expertise match';
  if (tags.some(tag => ['data', 'analytics'].includes(tag))) return 'Data expertise match';
  if (tags.some(tag => ['energy', 'sustainability'].includes(tag))) return 'Energy expertise match';
  if (tags.some(tag => ['media', 'communication'].includes(tag))) return 'Communications expertise match';
  
  return 'General research assignment';
};

/**
 * Gets assignment statistics from team_members table
 */
export const getContactAssignmentStats = async (): Promise<{
  totalContacts: number;
  assignedContacts: number;
  unassignedContacts: number;
  teamMemberStats: Array<{ name: string; contactCount: number; department: string; role: string; }>;
}> => {
  try {
    // Get contacts with assignments
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, assigned_to');

    if (contactsError) {
      throw contactsError;
    }

    // Get team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, first_name, last_name, department, role')
      .eq('is_active', true);

    if (teamError) {
      throw teamError;
    }

    if (!contacts || !teamMembers) {
      return {
        totalContacts: 0,
        assignedContacts: 0,
        unassignedContacts: 0,
        teamMemberStats: []
      };
    }

    const totalContacts = contacts.length;
    const assignedContacts = contacts.filter(c => c.assigned_to).length;
    const unassignedContacts = totalContacts - assignedContacts;

    // Calculate contacts per team member
    const teamMemberStats = teamMembers.map(member => {
      const contactCount = contacts.filter(c => c.assigned_to === member.id).length;
      const name = `${member.first_name} ${member.last_name}`;
      
      return {
        name,
        contactCount,
        department: member.department,
        role: member.role
      };
    }).sort((a, b) => b.contactCount - a.contactCount);

    return {
      totalContacts,
      assignedContacts,
      unassignedContacts,
      teamMemberStats
    };

  } catch (error) {
    console.error('Error getting assignment stats:', error);
    return {
      totalContacts: 0,
      assignedContacts: 0,
      unassignedContacts: 0,
      teamMemberStats: []
    };
  }
};