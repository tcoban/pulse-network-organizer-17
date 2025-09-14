import { useState } from 'react';
import { Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ContactCard from '@/components/ContactCard';
import { ArrowLeft, Users, Building2, Tag, Network, Clock, Calendar, Bell, UserPlus, AlertCircle } from 'lucide-react';

export type DrillDownType = 
  | 'recent-interactions'
  | 'companies' 
  | 'tags'
  | 'open-matches'
  | 're-engagement'
  | 'auto-introductions'
  | 'follow-up-alerts'
  | 'opportunity-matches'
  | null;

interface DrillDownViewProps {
  type: DrillDownType;
  contacts: Contact[];
  onClose: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onAddOpportunity: (contact: Contact) => void;
  onEditOpportunity: (opportunity: any, contact: Contact) => void;
}

const DrillDownView = ({ 
  type, 
  contacts, 
  onClose, 
  onEditContact, 
  onDeleteContact, 
  onViewDetails,
  onUpdateContact,
  onAddOpportunity, 
  onEditOpportunity 
}: DrillDownViewProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper function to find contacts that can be introduced to each other
  const findIntroductionCandidates = (contacts: Contact[]) => {
    const candidates = new Set<Contact>();
    
    // Find contacts with matching offerings and needs
    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contact1 = contacts[i];
        const contact2 = contacts[j];
        
        if (!contact1.lookingFor || !contact2.offering || 
            !contact1.offering || !contact2.lookingFor) continue;
        
        // Simple keyword matching
        const hasMatch1 = contact1.lookingFor.toLowerCase().split(/[\s,]+/).some(word => 
          word.length > 3 && contact2.offering.toLowerCase().includes(word)
        );
        
        const hasMatch2 = contact2.lookingFor.toLowerCase().split(/[\s,]+/).some(word => 
          word.length > 3 && contact1.offering.toLowerCase().includes(word)
        );
        
        if (hasMatch1 || hasMatch2) {
          candidates.add(contact1);
          candidates.add(contact2);
        }
      }
    }
    
    return Array.from(candidates);
  };

  if (!type) return null;

  const getFilteredContacts = () => {
    switch (type) {
      case 'recent-interactions':
        return contacts.filter(contact => 
          contact.lastContact && 
          contact.lastContact > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
      
      case 're-engagement':
        return contacts.filter(contact => 
          !contact.lastContact || 
          contact.lastContact <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        );
      
      case 'companies':
        // Group by company and return one contact per company
        const companiesMap = new Map<string, Contact>();
        contacts.forEach(contact => {
          if (contact.company && !companiesMap.has(contact.company)) {
            companiesMap.set(contact.company, contact);
          }
        });
        return Array.from(companiesMap.values());
      
      case 'tags':
        // Return contacts that have tags
        return contacts.filter(contact => contact.tags.length > 0);
      
      case 'open-matches':
        // Return contacts that have both offering and looking for data
        return contacts.filter(contact => contact.offering && contact.lookingFor);
      
      case 'auto-introductions':
        // Find contacts that can potentially be introduced to each other
        return findIntroductionCandidates(contacts);
      
      case 'follow-up-alerts':
        // Same as re-engagement but different context
        return contacts.filter(contact => 
          !contact.lastContact || 
          contact.lastContact <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        );
      
      case 'opportunity-matches':
        // Return contacts with high cooperation ratings and current projects
        return contacts.filter(contact => 
          (contact.cooperationRating >= 4 || contact.potentialScore >= 4) &&
          contact.currentProjects
        );
      
      default:
        return [];
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'recent-interactions':
        return 'Recent Interactions';
      case 're-engagement':
        return 'Re-engagement Needed';
      case 'companies':
        return 'Companies';
      case 'tags':
        return 'Tagged Contacts';
      case 'open-matches':
        return 'Potential Matches';
      case 'auto-introductions':
        return 'Auto-Introduction Ready';
      case 'follow-up-alerts':
        return 'Follow-up Alerts';
      case 'opportunity-matches':
        return 'Opportunity Matches';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'recent-interactions':
        return 'Contacts with interactions in the last 30 days';
      case 're-engagement':
        return 'Contacts not contacted for 90+ days or never contacted';
      case 'companies':
        return 'Unique companies in your contact network';
      case 'tags':
        return 'Contacts organized by tags';
      case 'open-matches':
        return 'Contacts with matching interests and offerings';
      case 'auto-introductions':
        return 'Contacts ready for AI-suggested introductions';
      case 'follow-up-alerts':
        return 'Contacts requiring relationship maintenance';
      case 'opportunity-matches':
        return 'High-potential contacts with active projects';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'recent-interactions':
        return Calendar;
      case 're-engagement':
        return Clock;
      case 'companies':
        return Building2;
      case 'tags':
        return Tag;
      case 'open-matches':
        return Network;
      case 'auto-introductions':
        return UserPlus;
      case 'follow-up-alerts':
        return AlertCircle;
      case 'opportunity-matches':
        return Bell;
      default:
        return Users;
    }
  };

  const filteredContacts = getFilteredContacts();
  const Icon = getIcon();

  const renderCompanyView = () => {
    if (type !== 'companies') return null;

    const companiesMap = new Map<string, Contact[]>();
    contacts.forEach(contact => {
      if (contact.company) {
        if (!companiesMap.has(contact.company)) {
          companiesMap.set(contact.company, []);
        }
        companiesMap.get(contact.company)!.push(contact);
      }
    });

    return (
      <div className="space-y-4">
        {Array.from(companiesMap.entries()).map(([company, companyContacts]) => (
          <Card key={company}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company}
                <Badge variant="secondary">{companyContacts.length} contacts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyContacts.map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={onEditContact}
                    onDelete={onDeleteContact}
                    onViewDetails={onViewDetails}
                    onUpdateContact={onUpdateContact}
                    onAddOpportunity={() => onAddOpportunity(contact)}
                    onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, contact)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTagsView = () => {
    if (type !== 'tags') return null;

    const tagsMap = new Map<string, Contact[]>();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        if (!tagsMap.has(tag)) {
          tagsMap.set(tag, []);
        }
        tagsMap.get(tag)!.push(contact);
      });
    });

    return (
      <div className="space-y-4">
        {Array.from(tagsMap.entries())
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([tag, tagContacts]) => (
          <Card key={tag}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {tag}
                <Badge variant="secondary">{tagContacts.length} contacts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tagContacts.slice(0, 6).map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={onEditContact}
                  onDelete={onDeleteContact}
                  onViewDetails={onViewDetails}
                  onUpdateContact={onUpdateContact}
                  onAddOpportunity={() => onAddOpportunity(contact)}
                  onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, contact)}
                />
                ))}
              </div>
              {tagContacts.length > 6 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  And {tagContacts.length - 6} more contacts...
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderIntroductionView = () => {
    if (type !== 'auto-introductions') return null;

    const introductionPairs = findIntroductionPairs(contacts);

    return (
      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              AI Introduction Engine
            </CardTitle>
            <CardDescription>
              Based on matching interests and offerings, here are potential introduction opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleStartIntroductions(introductionPairs)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Start AI-Suggested Introductions ({introductionPairs.length} pairs)
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {introductionPairs.map((pair, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg">Introduction Opportunity #{index + 1}</CardTitle>
                <CardDescription>
                  {pair.matchReason}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Contact 1</h4>
                    <ContactCard
                      contact={pair.contact1}
                      onEdit={onEditContact}
                      onDelete={onDeleteContact}
                      onViewDetails={onViewDetails}
                      onUpdateContact={onUpdateContact}
                      onAddOpportunity={() => onAddOpportunity(pair.contact1)}
                      onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, pair.contact1)}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Contact 2</h4>
                    <ContactCard
                      contact={pair.contact2}
                      onEdit={onEditContact}
                      onDelete={onDeleteContact}
                      onViewDetails={onViewDetails}
                      onUpdateContact={onUpdateContact}
                      onAddOpportunity={() => onAddOpportunity(pair.contact2)}
                      onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, pair.contact2)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSingleIntroduction(pair)}
                    className="flex-1"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Make This Introduction
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSkipIntroduction(pair)}
                  >
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to find introduction pairs with match reasoning
  const findIntroductionPairs = (contacts: Contact[]) => {
    const pairs = [];
    
    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const contact1 = contacts[i];
        const contact2 = contacts[j];
        
        if (!contact1.lookingFor || !contact2.offering || 
            !contact1.offering || !contact2.lookingFor) continue;
        
        const matches = [];
        
        // Check if contact1 is looking for what contact2 offers
        const match1 = contact1.lookingFor.toLowerCase().split(/[\s,]+/).find(word => 
          word.length > 3 && contact2.offering.toLowerCase().includes(word)
        );
        
        // Check if contact2 is looking for what contact1 offers
        const match2 = contact2.lookingFor.toLowerCase().split(/[\s,]+/).find(word => 
          word.length > 3 && contact1.offering.toLowerCase().includes(word)
        );
        
        if (match1) {
          matches.push(`${contact1.name} is looking for "${match1}" which ${contact2.name} offers`);
        }
        
        if (match2) {
          matches.push(`${contact2.name} is looking for "${match2}" which ${contact1.name} offers`);
        }
        
        if (matches.length > 0) {
          pairs.push({
            contact1,
            contact2,
            matchReason: matches.join('. '),
            matchScore: matches.length
          });
        }
      }
    }
    
    return pairs.sort((a, b) => b.matchScore - a.matchScore);
  };

  const handleStartIntroductions = (pairs: any[]) => {
    // This would typically integrate with an email service or notification system
    console.log('Starting AI introductions for', pairs.length, 'pairs');
    // For now, we'll show a success message
    alert(`Preparing ${pairs.length} AI-suggested introductions. You'll receive drafts shortly.`);
  };

  const handleSingleIntroduction = (pair: any) => {
    console.log('Making introduction between', pair.contact1.name, 'and', pair.contact2.name);
    alert(`Preparing introduction between ${pair.contact1.name} and ${pair.contact2.name}. You'll receive a draft shortly.`);
  };

  const handleSkipIntroduction = (pair: any) => {
    console.log('Skipping introduction between', pair.contact1.name, 'and', pair.contact2.name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{getTitle()}</h1>
              <p className="text-muted-foreground">{getDescription()}</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
        </Badge>
      </div>

      {/* Content */}
      {type === 'companies' ? (
        renderCompanyView()
      ) : type === 'tags' ? (
        renderTagsView()
      ) : type === 'auto-introductions' ? (
        renderIntroductionView()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={onEditContact}
            onDelete={onDeleteContact}
            onViewDetails={onViewDetails}
            onUpdateContact={onUpdateContact}
            onAddOpportunity={() => onAddOpportunity(contact)}
            onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, contact)}
          />
          ))}
        </div>
      )}

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
            <p className="text-muted-foreground">
              There are no contacts matching this criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrillDownView;