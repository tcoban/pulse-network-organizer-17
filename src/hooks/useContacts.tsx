import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact';
import { useAuth } from './useAuth';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch contacts from database
  const fetchContacts = async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch contacts with all related data
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_preferences (*),
          contact_tags (tag),
          contact_social_links (platform, url),
          interactions (*),
          opportunities (
            *,
            meeting_goals (*)
          ),
          event_participations (*),
          collaborations (*)
        `);

      if (contactsError) throw contactsError;

      // Transform database data to Contact type
      const transformedContacts: Contact[] = contactsData?.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        position: contact.position,
        avatar: contact.avatar,
        tags: contact.contact_tags?.map((tag: any) => tag.tag) || [],
        notes: contact.notes || '',
        lastContact: contact.last_contact ? new Date(contact.last_contact) : undefined,
        addedDate: new Date(contact.added_date),
        socialLinks: {
          linkedin: contact.contact_social_links?.find((link: any) => link.platform === 'linkedin')?.url,
          twitter: contact.contact_social_links?.find((link: any) => link.platform === 'twitter')?.url,
          github: contact.contact_social_links?.find((link: any) => link.platform === 'github')?.url,
        },
        customFields: {},
        interactionHistory: contact.interactions?.map((interaction: any) => ({
          id: interaction.id,
          type: interaction.type,
          date: new Date(interaction.date),
          description: interaction.description,
          outcome: interaction.outcome,
          contactedBy: interaction.contacted_by,
          channel: interaction.channel,
          evaluation: interaction.evaluation,
        })) || [],
        referredBy: contact.referred_by,
        linkedinConnections: contact.linkedin_connections || [],
        currentProjects: contact.current_projects,
        mutualBenefit: contact.mutual_benefit,
        cooperationRating: contact.cooperation_rating,
        potentialScore: contact.potential_score,
        affiliation: contact.affiliation,
        offering: contact.offering,
        lookingFor: contact.looking_for,
        upcomingOpportunities: contact.opportunities?.map((opp: any) => ({
          id: opp.id,
          type: opp.type,
          title: opp.title,
          date: new Date(opp.date),
          location: opp.location,
          description: opp.description,
          registrationStatus: opp.registration_status,
          meetingGoals: opp.meeting_goals?.map((goal: any) => ({
            id: goal.id,
            description: goal.description,
            achieved: goal.achieved,
          })) || [],
        })) || [],
        assignedTo: contact.assigned_to,
        createdBy: contact.created_by,
        preferences: contact.contact_preferences?.[0] ? {
          language: contact.contact_preferences[0].language,
          preferredChannel: contact.contact_preferences[0].preferred_channel,
          availableTimes: contact.contact_preferences[0].available_times,
          meetingLocation: contact.contact_preferences[0].meeting_location,
        } : undefined,
      })) || [];

      setContacts(transformedContacts);
      setError(null);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  // Create new contact
  const createContact = async (contactData: Omit<Contact, 'id' | 'addedDate' | 'interactionHistory' | 'upcomingOpportunities'>) => {
    if (!user) throw new Error('User not authenticated');

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
          assigned_to: user.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // Insert preferences if provided
      if (contactData.preferences) {
        await supabase
          .from('contact_preferences')
          .insert({
            contact_id: contact.id,
            language: contactData.preferences.language,
            preferred_channel: contactData.preferences.preferredChannel,
            available_times: contactData.preferences.availableTimes,
            meeting_location: contactData.preferences.meetingLocation,
          });
      }

      // Insert tags
      if (contactData.tags && contactData.tags.length > 0) {
        await supabase
          .from('contact_tags')
          .insert(
            contactData.tags.map(tag => ({
              contact_id: contact.id,
              tag,
            }))
          );
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
          await supabase
            .from('contact_social_links')
            .insert(socialLinksToInsert);
        }
      }

      await fetchContacts();
      return contact;
    } catch (err) {
      console.error('Error creating contact:', err);
      throw err;
    }
  };

  // Update existing contact
  const updateContact = async (contactId: string, contactData: Partial<Contact>) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position,
          avatar: contactData.avatar,
          notes: contactData.notes,
          last_contact: contactData.lastContact?.toISOString(),
          referred_by: contactData.referredBy,
          linkedin_connections: contactData.linkedinConnections,
          current_projects: contactData.currentProjects,
          mutual_benefit: contactData.mutualBenefit,
          cooperation_rating: contactData.cooperationRating,
          potential_score: contactData.potentialScore,
          affiliation: contactData.affiliation,
          offering: contactData.offering,
          looking_for: contactData.lookingFor,
        })
        .eq('id', contactId);

      if (error) throw error;

      await fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
      throw err;
    }
  };

  // Delete contact
  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      await fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
};