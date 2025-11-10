import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays } from 'date-fns';
import { Contact } from '@/types/contact';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { ComprehensiveDashboard } from '@/components/ComprehensiveDashboard';
import { DrillDownView, DrillDownType } from '@/components/DrillDownView';
import OperationsMode from '@/components/OperationsMode';
import ContactForm from '@/components/ContactForm';
import OpportunityFormEnhanced from '@/components/OpportunityFormEnhanced';
import BulkActionMode from '@/components/BulkActionMode';
import { LinkGoalsToContactDialog } from '@/components/LinkGoalsToContactDialog';
import { GoalForm } from '@/components/GoalForm';

import { Button } from '@/components/ui/button';


const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { contacts, loading: contactsLoading, error: contactsError, createContact, updateContact, deleteContact } = useContacts();
  const { user } = useAuth();
  
  const [isOperationsMode, setIsOperationsMode] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [drillDownType, setDrillDownType] = useState<DrillDownType>(null);
  const [showBulkActionMode, setShowBulkActionMode] = useState(false);
  const [bulkActionContacts, setBulkActionContacts] = useState<Contact[]>([]);
  const [linkGoalsDialogOpen, setLinkGoalsDialogOpen] = useState(false);
  const [selectedGoalIdForLinking, setSelectedGoalIdForLinking] = useState<string | null>(null);
  const [goalFormOpen, setGoalFormOpen] = useState(false);

  const handleLinkContactToGoal = (goalId: string) => {
    setSelectedGoalIdForLinking(goalId);
    setLinkGoalsDialogOpen(true);
  };

  const handleViewGoal = (goalId: string) => {
    // Navigate to goals page with specific goal highlighted
    window.location.href = `/goals?goalId=${goalId}`;
  };

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

        {/* Comprehensive Dashboard */}
        <ComprehensiveDashboard
          onCreateGoal={() => setGoalFormOpen(true)}
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

      {/* Link Goals Dialog */}
      <LinkGoalsToContactDialog
        isOpen={linkGoalsDialogOpen}
        onClose={() => {
          setLinkGoalsDialogOpen(false);
          setSelectedGoalIdForLinking(null);
        }}
        contactId={''}
        contactName="All Contacts"
      />

      {/* Goal Form */}
      <GoalForm
        projectId=""
        isOpen={goalFormOpen}
        onClose={() => setGoalFormOpen(false)}
      />
    </div>
  );
};

export default Index;