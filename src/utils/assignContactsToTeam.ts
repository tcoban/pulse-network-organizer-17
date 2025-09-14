import { supabase } from '@/integrations/supabase/client';
import { swissTeamMembers, assignContactToTeamMember } from '@/data/swissTeamMembers';

interface ContactAssignment {
  contactId: string;
  contactName: string;
  contactEmail: string;
  assignedToId: string;
  assignedToName: string;
  reason: string;
}

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
    
    // Get all team members (existing profiles)
    const { data: teamMembers, error: teamError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email');

    if (teamError) {
      throw teamError;
    }

    if (!teamMembers || teamMembers.length === 0) {
      throw new Error('No team members found in profiles table');
    }

    console.log(`Found ${teamMembers.length} team members`);

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
        
        // Smart assignment based on contact characteristics
        let assignedTeamMember;
        let assignmentReason = '';

        // Financial sector contacts
        if (tags.some(tag => ['finance', 'banking', 'fintech', 'investment'].includes(tag)) ||
            contact.company?.toLowerCase().includes('bank') ||
            contact.position?.toLowerCase().includes('financial')) {
          
          const financialExperts = teamMembers.filter(tm => 
            tm.first_name?.includes('Andreas') || // Dr. Andreas Müller - financial expert
            tm.first_name?.includes('Thomas')     // Dr. Thomas Huber - international trade/finance
          );
          
          if (financialExperts.length > 0) {
            assignedTeamMember = financialExperts[Math.floor(Math.random() * financialExperts.length)];
            assignmentReason = 'Financial expertise match';
          }
        }

        // Tech and innovation contacts
        if (!assignedTeamMember && (
            tags.some(tag => ['tech', 'AI', 'innovation', 'startup'].includes(tag)) ||
            contact.position?.toLowerCase().includes('tech'))) {
          
          const techExperts = teamMembers.filter(tm => 
            tm.first_name?.includes('Margrit') || // Dr. Margrit Baumgartner - innovation
            tm.first_name?.includes('Lukas') ||   // Lukas Brunner - data science
            tm.first_name?.includes('Werner')     // Werner Schmid - IT
          );
          
          if (techExperts.length > 0) {
            assignedTeamMember = techExperts[Math.floor(Math.random() * techExperts.length)];
            assignmentReason = 'Technology expertise match';
          }
        }

        // International contacts
        if (!assignedTeamMember && (
            tags.some(tag => ['international', 'trade', 'global'].includes(tag)) ||
            contact.company?.toLowerCase().includes('international'))) {
          
          const internationalExperts = teamMembers.filter(tm => 
            tm.first_name?.includes('Simone') ||  // Dr. Simone Gerber - international relations
            tm.first_name?.includes('Patrick')    // Patrick Lehmann - international specialist
          );
          
          if (internationalExperts.length > 0) {
            assignedTeamMember = internationalExperts[Math.floor(Math.random() * internationalExperts.length)];
            assignmentReason = 'International expertise match';
          }
        }

        // Policy and government contacts
        if (!assignedTeamMember && (
            tags.some(tag => ['policy', 'government', 'public'].includes(tag)) ||
            contact.company?.toLowerCase().includes('government') ||
            contact.company?.toLowerCase().includes('ministry'))) {
          
          const policyExperts = teamMembers.filter(tm => 
            tm.first_name?.includes('Elisabeth') || // Prof. Elisabeth Weber - head of research
            tm.first_name?.includes('Hans')         // Dr. Hans Zimmermann - director
          );
          
          if (policyExperts.length > 0) {
            assignedTeamMember = policyExperts[Math.floor(Math.random() * policyExperts.length)];
            assignmentReason = 'Policy expertise match';
          }
        }

        // Data and analytics contacts
        if (!assignedTeamMember && (
            tags.some(tag => ['data', 'analytics', 'statistics'].includes(tag)) ||
            contact.position?.toLowerCase().includes('data'))) {
          
          const dataExperts = teamMembers.filter(tm => 
            tm.first_name?.includes('Beat') ||    // Beat Wyss - head of data services
            tm.first_name?.includes('Petra') ||   // Petra Hofmann - data analyst
            tm.first_name?.includes('Stefan')     // Stefan Meier - research associate
          );
          
          if (dataExperts.length > 0) {
            assignedTeamMember = dataExperts[Math.floor(Math.random() * dataExperts.length)];
            assignmentReason = 'Data expertise match';
          }
        }

        // Default assignment to research team
        if (!assignedTeamMember) {
          const researchTeam = teamMembers.filter(tm => 
            tm.first_name?.includes('Claudia') || // Dr. Claudia Fischer
            tm.first_name?.includes('Nicole') ||  // Nicole Graf
            tm.first_name?.includes('Daniel') ||  // Daniel Schneider
            tm.first_name?.includes('Sandra')     // Sandra Keller
          );
          
          if (researchTeam.length > 0) {
            assignedTeamMember = researchTeam[Math.floor(Math.random() * researchTeam.length)];
            assignmentReason = 'General research assignment';
          } else {
            // Ultimate fallback - any team member
            assignedTeamMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
            assignmentReason = 'Random assignment';
          }
        }

        if (assignedTeamMember) {
          const teamMemberName = `${assignedTeamMember.first_name || ''} ${assignedTeamMember.last_name || ''}`.trim();
          
          assignments.push({
            contactId: contact.id,
            contactName: contact.name,
            contactEmail: contact.email,
            assignedToId: assignedTeamMember.id,
            assignedToName: teamMemberName,
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
 * Gets assignment statistics
 */
export const getContactAssignmentStats = async (): Promise<{
  totalContacts: number;
  assignedContacts: number;
  unassignedContacts: number;
  teamMemberStats: Array<{ name: string; contactCount: number; }>;
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
      .from('profiles')
      .select('id, first_name, last_name');

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
      const name = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown';
      
      return {
        name,
        contactCount
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