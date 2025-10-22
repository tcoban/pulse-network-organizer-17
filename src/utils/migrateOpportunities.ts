import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Migrates opportunities from JSONB field in contacts table
 * to the new opportunities and meeting_goals tables
 */
export async function migrateOpportunitiesFromJSONB() {
  try {
    console.log('Starting opportunity migration...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Note: This migration utility is designed for JSONB-based opportunities
    // The current database schema doesn't have an 'upcoming_opportunities' column
    // This utility is kept for documentation purposes only
    
    console.log('Migration utility ready (currently no JSONB opportunities in schema)');
    toast.info('No JSONB-based opportunities to migrate');
    return { migrated: 0, errors: 0 };

    /* Original migration code - kept for reference:
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, name, upcoming_opportunities')
      .not('upcoming_opportunities', 'is', null);

    if (fetchError) throw fetchError;

    if (!contacts || contacts.length === 0) {
      console.log('No contacts with JSONB opportunities found');
      toast.info('No legacy opportunities to migrate');
      return { migrated: 0, errors: 0 };
    }

    let migratedCount = 0;
    let errorCount = 0;

    // Process each contact
    for (const contact of contacts) {
      const opportunities = (contact as any).upcoming_opportunities || [];
      
      if (!Array.isArray(opportunities) || opportunities.length === 0) {
        continue;
      }

      console.log(`Migrating ${opportunities.length} opportunities for contact ${contact.name}`);

      // Process each opportunity
      for (const opp of opportunities) {
        try {
          // Insert opportunity
          const { data: newOpp, error: oppError } = await supabase
            .from('opportunities')
            .insert({
              contact_id: contact.id,
              title: opp.title || 'Untitled Opportunity',
              type: opp.type || 'other',
              date: opp.date ? new Date(opp.date).toISOString() : new Date().toISOString(),
              location: opp.location,
              description: opp.description,
              registration_status: opp.registrationStatus || 'considering',
              source: 'manual',
              synced_to_calendar: false,
              created_by: user.id,
            })
            .select()
            .single();

          if (oppError) {
            console.error('Error migrating opportunity:', oppError);
            errorCount++;
            continue;
          }

          migratedCount++;

          // Migrate meeting goals if they exist
          if (opp.meetingGoals && Array.isArray(opp.meetingGoals) && opp.meetingGoals.length > 0) {
            const goalsToInsert = opp.meetingGoals.map((goal: any) => ({
              opportunity_id: newOpp.id,
              description: goal.description || '',
              achieved: goal.achieved || false,
              related_project: goal.relatedProject,
            }));

            const { error: goalsError } = await supabase
              .from('meeting_goals')
              .insert(goalsToInsert);

            if (goalsError) {
              console.error('Error migrating goals:', goalsError);
            } else {
              console.log(`  Migrated ${goalsToInsert.length} goals`);
            }
          }
        } catch (err) {
          console.error('Error processing opportunity:', err);
          errorCount++;
        }
      }
    }

    const message = `Migration complete: ${migratedCount} opportunities migrated${errorCount > 0 ? `, ${errorCount} errors` : ''}`;
    console.log(message);
    
    if (errorCount === 0) {
      toast.success(message);
    } else {
      toast.warning(message);
    }

    return { migrated: migratedCount, errors: errorCount };
    */
  } catch (err) {
    console.error('Migration failed:', err);
    toast.error('Migration failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    throw err;
  }
}
