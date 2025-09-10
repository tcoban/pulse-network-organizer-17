import { supabase } from '@/integrations/supabase/client';
import { generateSyntheticContacts } from './generateSyntheticContacts';

export const insertSyntheticContacts = async () => {
  const contacts = generateSyntheticContacts();
  
  console.log(`Starting insertion of ${contacts.length} synthetic contacts...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const contactData of contacts) {
    try {
      // Insert contact
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position,
          avatar: contactData.avatar,
          notes: contactData.notes,
          referred_by: contactData.referredBy,
          linkedin_connections: contactData.linkedinConnections,
          current_projects: contactData.currentProjects,
          mutual_benefit: contactData.mutualBenefit,
          cooperation_rating: contactData.cooperationRating,
          potential_score: contactData.potentialScore,
          affiliation: contactData.affiliation,
          offering: contactData.offering,
          looking_for: contactData.lookingFor,
          assigned_to: contactData.assignedTo,
          created_by: contactData.createdBy,
        })
        .select()
        .single();

      if (contactError) {
        console.error(`Error inserting contact ${contactData.name}:`, contactError);
        errorCount++;
        continue;
      }

      // Insert preferences if provided
      if (contactData.preferences) {
        const { error: preferencesError } = await supabase
          .from('contact_preferences')
          .insert({
            contact_id: contact.id,
            language: contactData.preferences.language,
            preferred_channel: contactData.preferences.preferredChannel as 'email' | 'phone' | 'linkedin',
            available_times: contactData.preferences.availableTimes,
            meeting_location: contactData.preferences.meetingLocation,
          });

        if (preferencesError) {
          console.error(`Error inserting preferences for ${contactData.name}:`, preferencesError);
        }
      }

      // Insert tags
      if (contactData.tags && contactData.tags.length > 0) {
        const { error: tagsError } = await supabase
          .from('contact_tags')
          .insert(
            contactData.tags.map(tag => ({
              contact_id: contact.id,
              tag,
            }))
          );

        if (tagsError) {
          console.error(`Error inserting tags for ${contactData.name}:`, tagsError);
        }
      }

      // Insert social links
      if (contactData.socialLinks) {
        const socialLinksToInsert = Object.entries(contactData.socialLinks)
          .filter(([_, url]) => url && url.trim() !== '')
          .map(([platform, url]) => ({
            contact_id: contact.id,
            platform,
            url,
          }));

        if (socialLinksToInsert.length > 0) {
          const { error: socialLinksError } = await supabase
            .from('contact_social_links')
            .insert(socialLinksToInsert);

          if (socialLinksError) {
            console.error(`Error inserting social links for ${contactData.name}:`, socialLinksError);
          }
        }
      }

      successCount++;
      console.log(`✓ Inserted contact ${successCount}/${contacts.length}: ${contactData.name}`);
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (err) {
      console.error(`Error processing contact ${contactData.name}:`, err);
      errorCount++;
    }
  }
  
  console.log(`\nInsertion completed!`);
  console.log(`✓ Successfully inserted: ${successCount} contacts`);
  if (errorCount > 0) {
    console.log(`✗ Failed to insert: ${errorCount} contacts`);
  }
  
  return { successCount, errorCount };
};