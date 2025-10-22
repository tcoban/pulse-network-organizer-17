import { useState, useMemo } from 'react';
import { Contact } from '@/types/contact';
import { useContacts } from '@/hooks/useContacts';
import ContactCard from '@/components/ContactCard';
import ContactForm from '@/components/ContactForm';
import OpportunityFormEnhanced from '@/components/OpportunityFormEnhanced';
import AdvancedSearch from '@/components/AdvancedSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Filter,
  Grid,
  List,
  Brain,
  Plus,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Contacts = () => {
  const { contacts, loading: contactsLoading, error: contactsError, createContact, updateContact, deleteContact } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contact.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = selectedTag === 'all' || contact.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });

    // Sort contacts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'lastContact':
          const aDate = a.lastContact?.getTime() || 0;
          const bDate = b.lastContact?.getTime() || 0;
          return bDate - aDate;
        case 'added':
          return b.addedDate.getTime() - a.addedDate.getTime();
        case 'cooperationRating':
          return b.cooperationRating - a.cooperationRating;
        case 'potentialScore':
          return b.potentialScore - a.potentialScore;
        case 'tag':
          const aTag = a.tags[0] || '';
          const bTag = b.tags[0] || '';
          return aTag.localeCompare(bTag);
        default:
          return 0;
      }
    });

    return filtered;
  }, [contacts, searchQuery, selectedTag, sortBy]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
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
    console.log('View details:', contact.id);
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
        await updateContact(contactData.id, contactData);
      } else {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <Button onClick={handleAddContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <main className="p-6">
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

        {/* Advanced Search */}
        {showAdvancedSearch && (
          <AdvancedSearch 
            contacts={contacts} 
            onSelectContact={(contact) => {
              handleViewDetails(contact);
              setShowAdvancedSearch(false);
            }}
          />
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by tag:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedTag === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag('all')}
              >
                All ({contacts.length})
              </Badge>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag} ({contacts.filter(c => c.tags.includes(tag)).length})
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              variant="outline"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Search
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="company">Sort by Company</SelectItem>
                <SelectItem value="lastContact">Last Contact</SelectItem>
                <SelectItem value="added">Recently Added</SelectItem>
                <SelectItem value="cooperationRating">Cooperation Level</SelectItem>
                <SelectItem value="potentialScore">Potential Score</SelectItem>
                <SelectItem value="tag">Sort by Tag</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </p>
        </div>

        {/* Contact Grid */}
        {contactsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onViewDetails={handleViewDetails}
                onUpdateContact={handleUpdateContact}
                onAddOpportunity={() => handleAddOpportunity(contact)}
              />
            ))}
          </div>
        )}

        {filteredContacts.length === 0 && !contactsLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first contact.'
              }
            </p>
            <Button onClick={handleAddContact}>
              Add Your First Contact
            </Button>
          </div>
        )}
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
    </div>
  );
};

export default Contacts;
