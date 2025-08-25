import { useState, useMemo } from 'react';
import { Contact } from '@/types/contact';
import { mockContacts } from '@/data/mockContacts';
import Header from '@/components/Header';
import ContactCard from '@/components/ContactCard';
import StatsCard from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Calendar, 
  Tag,
  Filter,
  Grid,
  List
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    const companies = new Set(contacts.map(c => c.company).filter(Boolean)).size;

    return {
      total: contacts.length,
      recentContacts,
      companies,
      tags: allTags.length
    };
  }, [contacts, allTags]);

  const handleAddContact = () => {
    // TODO: Open add contact modal
    console.log('Add contact clicked');
  };

  const handleEditContact = (contact: Contact) => {
    // TODO: Open edit contact modal
    console.log('Edit contact:', contact.id);
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleViewDetails = (contact: Contact) => {
    // TODO: Open contact details modal
    console.log('View details:', contact.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddContact={handleAddContact}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Contacts"
            value={stats.total}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Recent Interactions"
            value={stats.recentContacts}
            icon={Calendar}
            description="Last 30 days"
          />
          <StatsCard
            title="Companies"
            value={stats.companies}
            icon={Building2}
          />
          <StatsCard
            title="Tags"
            value={stats.tags}
            icon={Tag}
          />
        </div>

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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="company">Sort by Company</SelectItem>
                <SelectItem value="lastContact">Last Contact</SelectItem>
                <SelectItem value="added">Recently Added</SelectItem>
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
            />
          ))}
        </div>

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
    </div>
  );
};

export default Index;