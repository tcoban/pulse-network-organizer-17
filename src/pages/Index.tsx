import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays } from 'date-fns';
import { Contact } from '@/types/contact';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import ClickableStatsCard from '@/components/ClickableStatsCard';
import { DrillDownView, DrillDownType } from '@/components/DrillDownView';
import OperationsMode from '@/components/OperationsMode';
import ContactForm from '@/components/ContactForm';
import OpportunityFormEnhanced from '@/components/OpportunityFormEnhanced';
import TeamOpportunities from '@/components/TeamOpportunities';
import SmartDashboard from '@/components/SmartDashboard';
import StrategicDashboard from '@/components/StrategicDashboard';
import ProjectForm from '@/components/ProjectForm';
import BulkActionMode from '@/components/BulkActionMode';
import { UpcomingMeetingsWidget } from '@/components/UpcomingMeetingsWidget';

import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Calendar, 
  Tag,
  CalendarDays,
  Settings
} from 'lucide-react';


const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { contacts, loading: contactsLoading, error: contactsError, createContact, updateContact, deleteContact } = useContacts();
  const { user } = useAuth();
  
  // Check URL parameter for view mode
  const viewParam = searchParams.get('view');
  const [isTeamOpportunitiesMode, setIsTeamOpportunitiesMode] = useState(viewParam === 'opportunities');
  const [isOperationsMode, setIsOperationsMode] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [drillDownType, setDrillDownType] = useState<DrillDownType>(null);
  const [aiIntroductionCount, setAiIntroductionCount] = useState(0);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showBulkActionMode, setShowBulkActionMode] = useState(false);
  const [bulkActionContacts, setBulkActionContacts] = useState<Contact[]>([]);

  // Sync URL param with team opportunities mode
  useEffect(() => {
    const viewParam = searchParams.get('view');
    setIsTeamOpportunitiesMode(viewParam === 'opportunities');
  }, [searchParams]);


  // Calculate stats
  const stats = useMemo(() => {
    const recentContacts = contacts.filter(contact => 
      contact.lastContact && 
      contact.lastContact > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    // Calculate contacts that need re-engagement (90+ days or never contacted)
    const needsReengagement = contacts.filter(contact => 
      !contact.lastContact || 
      contact.lastContact <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;

    const companies = new Set(contacts.map(c => c.company).filter(Boolean)).size;

    // Get unique tags
    const tagSet = new Set<string>();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag));
    });
    const tags = tagSet.size;

    // Calculate potential matches (basic keyword matching for now)
    const contactsWithData = contacts.filter(c => c.offering && c.lookingFor);
    let matchCount = 0;
    
    for (let i = 0; i < contactsWithData.length; i++) {
      for (let j = i + 1; j < contactsWithData.length; j++) {
        const contact1 = contactsWithData[i];
        const contact2 = contactsWithData[j];
        
        // Simple keyword matching - check if what one offers matches what the other is looking for
        const offering1Words = contact1.offering!.toLowerCase().split(/[\s,]+/);
        const looking1Words = contact1.lookingFor!.toLowerCase().split(/[\s,]+/);
        const offering2Words = contact2.offering!.toLowerCase().split(/[\s,]+/);
        const looking2Words = contact2.lookingFor!.toLowerCase().split(/[\s,]+/);
        
        // Check if contact1's offering matches contact2's looking for OR vice versa
        const hasMatch = offering1Words.some(word => 
          word.length > 3 && looking2Words.some(lookingWord => 
            lookingWord.includes(word) || word.includes(lookingWord)
          )
        ) || offering2Words.some(word => 
          word.length > 3 && looking1Words.some(lookingWord => 
            lookingWord.includes(word) || word.includes(lookingWord)
          )
        );
        
        if (hasMatch) {
          matchCount++;
        }
      }
    }

    return {
      total: contacts.length,
      recentContacts,
      companies,
      tags,
      openMatches: matchCount,
      needsReengagement
    };
  }, [contacts]);

  const handleAddContact = () => {
    setContactFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactFormOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleViewDetails = (contact: Contact) => {
    // TODO: Open contact details modal
    console.log('View details:', contact.id);
  };

  const handleDrillDown = (type: DrillDownType) => {
    setDrillDownType(type);
  };

  const handleAutomationDrillDown = (type: 'auto-introductions' | 'follow-up-alerts' | 'opportunity-matches') => {
    setDrillDownType(type);
  };

  const handleNavigateToSection = (destination: string, context?: any) => {
    switch (destination) {
      case 'strategic-planning':
        // Navigate to strategic planning view
        console.log('Navigate to strategic planning');
        break;
      case 'relationship-mapping':
        // Navigate to relationship mapping
        console.log('Navigate to relationship mapping');
        break;
      case 'campaign-management':
        // Navigate to campaign management
        console.log('Navigate to campaign management');
        break;
      case 'analytics-insights':
        // Navigate to analytics insights
        console.log('Navigate to analytics insights');
        break;
      default:
        console.log('Navigate to:', destination);
    }
  };

  const handleTakeAction = (actionType: string, preSelectedContacts?: Contact[]) => {
    if (preSelectedContacts && preSelectedContacts.length > 0) {
      // Scenario B: Direct action from dashboard with pre-selected contacts
      setBulkActionContacts(preSelectedContacts);
      setShowBulkActionMode(true);
    } else {
      // Scenario A: Go to operations mode first
      setIsOperationsMode(true);
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    try {
      await updateContact(updatedContact.id, updatedContact);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleSaveContact = async (contactData: Contact) => {
    try {
      if (editingContact) {
        // Update existing contact
        await updateContact(contactData.id, contactData);
      } else {
        // Add new contact
        await createContact(contactData);
      }
      setEditingContact(null);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleCloseContactForm = () => {
    setContactFormOpen(false);
    setEditingContact(null);
  };

  const handleAddOpportunity = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setOpportunityFormOpen(true);
  };

  const handleCloseOpportunityForm = () => {
    setOpportunityFormOpen(false);
    setSelectedContactId(null);
  };

  if (isOperationsMode) {
    return (
      <OperationsMode
        contacts={contacts}
        onClose={() => setIsOperationsMode(false)}
        onContactUpdate={(data: any) => {
          if (data?.action === 'bulkAction' && data?.contacts) {
            setBulkActionContacts(data.contacts);
            setIsOperationsMode(false);
            setShowBulkActionMode(true);
          } else {
            console.log('Operations mode update not yet implemented with new database pattern');
          }
        }}
      />
    );
  }

  if (isTeamOpportunitiesMode) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchTerm=""
          setSearchTerm={() => {}}
          setShowForm={setContactFormOpen}
          setShowAdvancedSearch={() => {}}
        />
        <main className="p-6">
          <div className="mb-6">
            <Button
              onClick={() => setIsTeamOpportunitiesMode(false)}
              variant="outline"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <TeamOpportunities 
            contacts={contacts}
            onUpdateContact={handleUpdateContact}
          />
        </main>
      </div>
    );
  }

  if (showBulkActionMode) {
    return (
      <BulkActionMode 
        selectedContacts={bulkActionContacts}
        onBack={() => {
          setShowBulkActionMode(false);
          setBulkActionContacts([]);
        }}
        onActionComplete={() => {
          setShowBulkActionMode(false);
          setBulkActionContacts([]);
        }}
      />
    );
  }


  // Filter contacts based on drill-down type
  const getDrillDownContacts = (type: DrillDownType) => {
    switch (type) {
      case 'auto-introductions':
        return contacts.filter(contact => 
          (contact.offering && contact.offering.trim().length > 0) || 
          (contact.lookingFor && contact.lookingFor.trim().length > 0)
        );
      case 'follow-up-alerts':
        return contacts.filter(contact => {
          if (!contact.lastContact) return true;
          const daysSinceContact = (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceContact >= 90;
        });
      case 'opportunity-matches':
        return contacts.filter(contact => 
          contact.upcomingOpportunities && contact.upcomingOpportunities.length > 0
        );
      default:
        return contacts;
    }
  };

  // Show drill-down view if active
  if (drillDownType) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchTerm=""
          setSearchTerm={() => {}}
          setShowForm={setContactFormOpen}
          setShowAdvancedSearch={() => {}}
        />
        <main className="p-6">
          <DrillDownView
            type={drillDownType}
            contacts={getDrillDownContacts(drillDownType)}
            onEditContact={handleEditContact}
            onDeleteContact={(contactId: string) => handleDeleteContact(contactId)}
            onViewDetails={handleViewDetails}
            onUpdateContact={handleUpdateContact}
            onAddOpportunity={handleAddOpportunity}
            onBack={() => setDrillDownType(null)}
            onAnalysisComplete={(count) => setAiIntroductionCount(count)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchTerm=""
        setSearchTerm={() => {}}
        setShowForm={setContactFormOpen}
        setShowAdvancedSearch={() => {}}
      />

      <main className="p-6">
        {/* Show error banner if RLS fails */}
        {contactsError && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">Failed to load contacts</p>
            <p className="text-sm text-destructive/80 mt-1">
              {contactsError.includes('row-level security') 
                ? 'Authentication required to access contacts data.' 
                : contactsError}
            </p>
          </div>
        )}


        {/* Overview Stats - Informational Only */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ClickableStatsCard
              title="Total Contacts"
              value={stats.total}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <ClickableStatsCard
              title="Recent Interactions"
              value={stats.recentContacts}
              icon={Calendar}
              description="Last 30 days"
              onClick={() => handleDrillDown('recent-interactions')}
            />
            <ClickableStatsCard
              title="Companies"
              value={stats.companies}
              icon={Building2}
              onClick={() => handleDrillDown('companies')}
            />
            <ClickableStatsCard
              title="Tags"
              value={stats.tags}
              icon={Tag}
              onClick={() => handleDrillDown('tags')}
            />
          </div>
        </div>

        {/* Upcoming Meetings Widget */}
        <UpcomingMeetingsWidget contacts={contacts} />

        {/* Strategic Dashboard */}
        <StrategicDashboard
          contacts={contacts} 
          onNavigate={handleNavigateToSection}
          onDrillDown={handleDrillDown}
          onCreateProject={() => setProjectFormOpen(true)}
          onEditProject={(project) => {
            setEditingProject(project);
            setProjectFormOpen(true);
          }}
        />

        {/* Smart Dashboard - Legacy Support */}
        <SmartDashboard 
          contacts={contacts} 
          onDrillDown={(type: string) => {
            if (type.startsWith('take-action-')) {
              const actionType = type.replace('take-action-', '');
              // Filter contacts based on action type for direct bulk action
              const relevantContacts = contacts.filter(contact => {
                switch (actionType) {
                  case 'followup':
                    return !contact.lastContact || 
                      (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24) > 30;
                  case 'meeting-prep':
                    return contact.upcomingOpportunities?.some(opp => 
                      opp.date >= new Date() && opp.date <= addDays(new Date(), 7)
                    );
                  default:
                    return contact.cooperationRating >= 4 || contact.potentialScore >= 4;
                }
              });
              handleTakeAction(actionType, relevantContacts);
            } else {
              handleAutomationDrillDown(type as any);
            }
          }} 
          aiIntroductionCount={aiIntroductionCount}
          stats={{ openMatches: stats.openMatches, needsReengagement: stats.needsReengagement }}
          onActionDrillDown={handleDrillDown}
        />
      </main>

      {/* Contact Form */}
      <ContactForm
        contact={editingContact || undefined}
        isOpen={contactFormOpen}
        onClose={handleCloseContactForm}
        onSave={handleSaveContact}
        isEditing={!!editingContact}
      />

      {/* Opportunity Form */}
      <OpportunityFormEnhanced
        contactId={selectedContactId || ''}
        isOpen={opportunityFormOpen}
        onClose={handleCloseOpportunityForm}
      />

      <ProjectForm
        project={editingProject}
        isOpen={projectFormOpen}
        onClose={() => {
          setProjectFormOpen(false);
          setEditingProject(null);
        }}
        onSave={(project) => {
          console.log('Save project:', project);
          setProjectFormOpen(false);
          setEditingProject(null);
        }}
      />
    </div>
  );
};

export default Index;