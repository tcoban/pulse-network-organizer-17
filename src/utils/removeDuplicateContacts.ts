import { supabase } from '@/integrations/supabase/client';

/**
 * Removes duplicate contacts from the database based on email address.
 * Keeps the oldest contact for each email.
 */
export const removeDuplicateContacts = async (): Promise<{ removed: number; errors: string[] }> => {
  try {
    console.log('Starting duplicate contact removal...');
    
    // First, get all contacts grouped by email
    const { data: allContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, email, created_at, name')
      .order('email', { ascending: true })
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    if (!allContacts || allContacts.length === 0) {
      return { removed: 0, errors: [] };
    }

    // Group contacts by email and identify duplicates
    const emailGroups: { [email: string]: typeof allContacts } = {};
    
    allContacts.forEach(contact => {
      if (!emailGroups[contact.email]) {
        emailGroups[contact.email] = [];
      }
      emailGroups[contact.email].push(contact);
    });

    // Find duplicates (groups with more than one contact)
    const duplicateGroups = Object.values(emailGroups).filter(group => group.length > 1);
    
    if (duplicateGroups.length === 0) {
      console.log('No duplicate contacts found.');
      return { removed: 0, errors: [] };
    }

    console.log(`Found ${duplicateGroups.length} email addresses with duplicates.`);

    let totalRemoved = 0;
    const errors: string[] = [];

    // For each group of duplicates, remove all but the oldest one
    for (const group of duplicateGroups) {
      // Sort by created_at to keep the oldest
      const sortedGroup = group.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Keep the first (oldest) and remove the rest
      const toKeep = sortedGroup[0];
      const toRemove = sortedGroup.slice(1);

      console.log(`Email: ${toKeep.email} - Keeping: ${toKeep.name} (${toKeep.created_at}), Removing: ${toRemove.length} duplicates`);

      // Remove the duplicates
      const idsToRemove = toRemove.map(contact => contact.id);
      
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .in('id', idsToRemove);

      if (deleteError) {
        const errorMsg = `Failed to remove duplicates for ${toKeep.email}: ${deleteError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      } else {
        totalRemoved += toRemove.length;
      }
    }

    console.log(`Duplicate removal completed. Removed ${totalRemoved} contacts. Errors: ${errors.length}`);
    
    return { removed: totalRemoved, errors };
    
  } catch (error) {
    console.error('Error in removeDuplicateContacts:', error);
    return { 
      removed: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'] 
    };
  }
};

/**
 * Checks for duplicate contacts in the database and returns a report
 */
export const checkForDuplicates = async (): Promise<{ duplicateCount: number; uniqueEmails: number; totalContacts: number }> => {
  try {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('email');

    if (error) {
      throw error;
    }

    if (!contacts) {
      return { duplicateCount: 0, uniqueEmails: 0, totalContacts: 0 };
    }

    const emails = contacts.map(c => c.email);
    const uniqueEmails = new Set(emails);
    
    return {
      duplicateCount: emails.length - uniqueEmails.size,
      uniqueEmails: uniqueEmails.size,
      totalContacts: emails.length
    };
    
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return { duplicateCount: 0, uniqueEmails: 0, totalContacts: 0 };
  }
};
