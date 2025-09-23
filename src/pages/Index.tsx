import { useState, useMemo } from 'react';
import { Contact, ContactOpportunity } from '@/types/contact';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ContactCard from '@/components/ContactCard';
import ClickableStatsCard from '@/components/ClickableStatsCard';
import { DrillDownView, DrillDownType } from '@/components/DrillDownView';
import OperationsMode from '@/components/OperationsMode';
import ContactForm from '@/components/ContactForm';
import OpportunityForm from '@/components/OpportunityForm';
import TeamOpportunities from '@/components/TeamOpportunities';
import SmartDashboard from '@/components/SmartDashboard';
import StrategicDashboard from '@/components/StrategicDashboard';
import AdvancedSearch from '@/components/AdvancedSearch';
import AdminPanel from '@/components/AdminPanel';
import EnhancedAdminPanel from '@/components/EnhancedAdminPanel';
import ProjectForm from '@/components/ProjectForm';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Calendar, 
  Tag,
  Filter,
  Grid,
  List,
  Network,
  Clock,
  Settings,
  CalendarDays,
  Brain,
  Crown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const { contacts, loading: contactsLoading, error: contactsError, createContact, updateContact, deleteContact } = useContacts();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isOperationsMode, setIsOperationsMode] = useState(false);
  const [isTeamOpportunitiesMode, setIsTeamOpportunitiesMode] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<ContactOpportunity | null>(null);
  const [selectedContactForOpportunity, setSelectedContactForOpportunity] = useState<Contact | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showEnhancedAdmin, setShowEnhancedAdmin] = useState(false);
  const [drillDownType, setDrillDownType] = useState<DrillDownType>(null);
  const [aiIntroductionCount, setAiIntroductionCount] = useState(0);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

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
          return b.cooperationRating - a.cooperationRating; // Higher ratings first
        case 'potentialScore':
          return b.potentialScore - a.potentialScore; // Higher scores first
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
          matchCount++; // Count each match once, not twice
        }
      }
    }

    return {
      total: contacts.length,
      recentContacts,
      companies,
      tags: allTags.length,
      openMatches: matchCount,
      needsReengagement
    };
  }, [contacts, allTags]);

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
    setSelectedContactForOpportunity(contact);
    setOpportunityFormOpen(true);
  };

  const handleEditOpportunity = (opportunity: ContactOpportunity, contact: Contact) => {
    setEditingOpportunity(opportunity);
    setSelectedContactForOpportunity(contact);
    setOpportunityFormOpen(true);
  };

  const handleSaveOpportunity = async (opportunityData: ContactOpportunity) => {
    if (!selectedContactForOpportunity) return;

    try {
      const updatedContact = {
        ...selectedContactForOpportunity,
        upcomingOpportunities: editingOpportunity
          ? selectedContactForOpportunity.upcomingOpportunities?.map(opp =>
              opp.id === opportunityData.id ? opportunityData : opp
            ) || []
          : [...(selectedContactForOpportunity.upcomingOpportunities || []), opportunityData]
      };

      await updateContact(updatedContact.id, updatedContact);
      
      setEditingOpportunity(null);
      setSelectedContactForOpportunity(null);
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleCloseOpportunityForm = () => {
    setOpportunityFormOpen(false);
    setEditingOpportunity(null);
    setSelectedContactForOpportunity(null);
  };

  if (isOperationsMode) {
    return (
      <OperationsMode
        contacts={contacts}
        onClose={() => setIsOperationsMode(false)}
        onContactUpdate={(updatedContacts) => {
          // This is a workaround since OperationsMode expects array but we have individual update
          // We'll need to refactor OperationsMode later to use the new hook pattern
          console.log('Operations mode update not yet implemented with new database pattern');
        }}
      />
    );
  }

  if (isTeamOpportunitiesMode) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          setShowForm={setContactFormOpen}
          setShowAdvancedSearch={setShowAdvancedSearch}
        />
        <main className="p-6">
          <div className="mb-6">
            <Button
              onClick={() => setIsTeamOpportunitiesMode(false)}
              variant="outline"
            >
              ← Back to Contacts
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

  if (showAdminPanel) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          setShowForm={setContactFormOpen}
          setShowAdvancedSearch={setShowAdvancedSearch}
          onShowAdminPanel={() => setShowAdminPanel(true)}
        />
        <main className="p-6">
          <div className="mb-6">
            <Button
              onClick={() => setShowAdminPanel(false)}
              variant="outline"
            >
              ← Back to Contacts
            </Button>
          </div>
          {showEnhancedAdmin ? <EnhancedAdminPanel /> : <AdminPanel />}
        </main>
      </div>
    );
  }

  if (showEnhancedAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          setShowForm={setContactFormOpen}
          setShowAdvancedSearch={setShowAdvancedSearch}
          onShowAdminPanel={() => setShowAdminPanel(true)}
        />
        <main className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <Button
              onClick={() => setShowEnhancedAdmin(false)}
              variant="outline"
            >
              ← Back to Contacts
            </Button>
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="outline"
            >
              Basic Admin Panel
            </Button>
          </div>
          <EnhancedAdminPanel />
        </main>
      </div>
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
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          setShowForm={setContactFormOpen}
          setShowAdvancedSearch={setShowAdvancedSearch}
          onShowAdminPanel={() => setShowAdminPanel(true)}
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
            onEditOpportunity={handleEditOpportunity}
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
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        setShowForm={setContactFormOpen}
        setShowAdvancedSearch={setShowAdvancedSearch}
        onShowAdminPanel={() => setShowAdminPanel(true)}
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
          onDrillDown={handleAutomationDrillDown} 
          aiIntroductionCount={aiIntroductionCount}
          stats={{ openMatches: stats.openMatches, needsReengagement: stats.needsReengagement }}
          onActionDrillDown={handleDrillDown}
        />

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
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Search
            </Button>

            <Button
              onClick={() => setIsTeamOpportunitiesMode(true)}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Team Opportunities
            </Button>
            
            <Button
              onClick={() => setIsOperationsMode(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Settings className="h-4 w-4 mr-2" />
              Operations Mode
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
              onEditOpportunity={(opportunity) => handleEditOpportunity(opportunity, contact)}
            />
          ))}
          </div>
        )}

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first contact.'
              }
            </p>
            <Button onClick={handleAddContact} className="bg-primary hover:bg-primary-hover">
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
      <OpportunityForm
        opportunity={editingOpportunity || undefined}
        isOpen={opportunityFormOpen}
        onClose={handleCloseOpportunityForm}
        onSave={handleSaveOpportunity}
        isEditing={!!editingOpportunity}
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