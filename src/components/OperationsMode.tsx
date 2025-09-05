import { useState, useMemo } from 'react';
import { Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Filter,
  Users,
  Building2,
  MapPin,
  Star,
  Calendar,
  Mail,
  Phone,
  Globe,
  Target,
  Briefcase,
  Clock,
  TrendingUp,
  Save,
  Download,
  Send,
  X,
  Plus
} from 'lucide-react';

interface FilterCriteria {
  searchQuery: string;
  tags: string[];
  companies: string[];
  locations: string[];
  cooperationRating: { min: number; max: number };
  potentialScore: { min: number; max: number };
  lastContactDays: { min: number; max: number };
  hasOpportunities: boolean | null;
  affiliations: string[];
  interactionTypes: string[];
  registrationStatus: string[];
}

interface OperationsModeProps {
  contacts: Contact[];
  onClose: () => void;
  onContactUpdate: (contacts: Contact[]) => void;
}

const OperationsMode = ({ contacts, onClose, onContactUpdate }: OperationsModeProps) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({
    searchQuery: '',
    tags: [],
    companies: [],
    locations: [],
    cooperationRating: { min: 1, max: 5 },
    potentialScore: { min: 1, max: 5 },
    lastContactDays: { min: 0, max: 365 },
    hasOpportunities: null,
    affiliations: [],
    interactionTypes: [],
    registrationStatus: []
  });
  
  const [savedLists, setSavedLists] = useState<Array<{ name: string; contactIds: string[] }>>([]);
  const [listName, setListName] = useState('');

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];
    const tags = [...new Set(contacts.flatMap(c => c.tags))];
    const affiliations = [...new Set(contacts.map(c => c.affiliation).filter(Boolean))];
    const locations = [...new Set(contacts.flatMap(c => 
      c.upcomingOpportunities?.map(o => o.location) || []
    ).filter(Boolean))];
    const interactionTypes = [...new Set(contacts.flatMap(c => c.interactionHistory.map(i => i.type)))];
    const registrationStatuses = [...new Set(contacts.flatMap(c => 
      c.upcomingOpportunities?.map(o => o.registrationStatus) || []
    ).filter(Boolean))];

    return {
      companies: companies.sort(),
      tags: tags.sort(),
      affiliations: affiliations.sort(),
      locations: locations.sort(),
      interactionTypes: interactionTypes.sort(),
      registrationStatuses: registrationStatuses.sort()
    };
  }, [contacts]);

  // Apply filters to contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Text search
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          contact.name.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.position?.toLowerCase().includes(searchLower) ||
          contact.notes.toLowerCase().includes(searchLower) ||
          contact.offering?.toLowerCase().includes(searchLower) ||
          contact.lookingFor?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (!filters.tags.some(tag => contact.tags.includes(tag))) return false;
      }

      // Companies filter
      if (filters.companies.length > 0) {
        if (!contact.company || !filters.companies.includes(contact.company)) return false;
      }

      // Affiliations filter
      if (filters.affiliations.length > 0) {
        if (!contact.affiliation || !filters.affiliations.includes(contact.affiliation)) return false;
      }

      // Cooperation rating filter
      if (contact.cooperationRating < filters.cooperationRating.min || 
          contact.cooperationRating > filters.cooperationRating.max) return false;

      // Potential score filter
      if (contact.potentialScore < filters.potentialScore.min || 
          contact.potentialScore > filters.potentialScore.max) return false;

      // Last contact days filter
      const daysSinceLastContact = contact.lastContact 
        ? Math.floor((Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceLastContact < filters.lastContactDays.min || 
          daysSinceLastContact > filters.lastContactDays.max) return false;

      // Has opportunities filter
      if (filters.hasOpportunities !== null) {
        const hasOpps = (contact.upcomingOpportunities?.length || 0) > 0;
        if (hasOpps !== filters.hasOpportunities) return false;
      }

      // Interaction types filter
      if (filters.interactionTypes.length > 0) {
        const hasMatchingInteraction = contact.interactionHistory.some(
          interaction => filters.interactionTypes.includes(interaction.type)
        );
        if (!hasMatchingInteraction) return false;
      }

      // Registration status filter
      if (filters.registrationStatus.length > 0) {
        const hasMatchingStatus = contact.upcomingOpportunities?.some(
          opp => opp.registrationStatus && filters.registrationStatus.includes(opp.registrationStatus)
        );
        if (!hasMatchingStatus) return false;
      }

      return true;
    });
  }, [contacts, filters]);

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSaveList = () => {
    if (listName && selectedContacts.length > 0) {
      setSavedLists(prev => [...prev, { name: listName, contactIds: [...selectedContacts] }]);
      setListName('');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      tags: [],
      companies: [],
      locations: [],
      cooperationRating: { min: 1, max: 5 },
      potentialScore: { min: 1, max: 5 },
      lastContactDays: { min: 0, max: 365 },
      hasOpportunities: null,
      affiliations: [],
      interactionTypes: [],
      registrationStatus: []
    });
  };

  const updateArrayFilter = (key: keyof FilterCriteria, value: string, add: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: add 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-card">
          <div className="flex items-center space-x-4">
            <Target className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Operations Mode</h1>
              <p className="text-sm text-muted-foreground">
                Advanced CRM filtering and segmentation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredContacts.length} contacts | {selectedContacts.length} selected
            </Badge>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Exit Operations Mode
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Filters Sidebar */}
          <div className="w-80 border-r bg-card/50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </h2>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>

              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search">Search & Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                  {/* Search */}
                  <div>
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Name, company, email, notes..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filterOptions.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => updateArrayFilter('tags', tag, !filters.tags.includes(tag))}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Companies */}
                  <div>
                    <Label className="text-sm font-medium">Companies</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {filterOptions.companies.map(company => (
                        <div key={company} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filters.companies.includes(company)}
                            onCheckedChange={(checked) => 
                              updateArrayFilter('companies', company, !!checked)
                            }
                          />
                          <span className="text-sm">{company}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  {/* Rating Ranges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Cooperation Rating</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={filters.cooperationRating.min}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            cooperationRating: { ...prev.cooperationRating, min: parseInt(e.target.value) || 1 }
                          }))}
                          className="w-16"
                        />
                        <span className="text-xs">to</span>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={filters.cooperationRating.max}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            cooperationRating: { ...prev.cooperationRating, max: parseInt(e.target.value) || 5 }
                          }))}
                          className="w-16"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Potential Score</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={filters.potentialScore.min}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            potentialScore: { ...prev.potentialScore, min: parseInt(e.target.value) || 1 }
                          }))}
                          className="w-16"
                        />
                        <span className="text-xs">to</span>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={filters.potentialScore.max}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            potentialScore: { ...prev.potentialScore, max: parseInt(e.target.value) || 5 }
                          }))}
                          className="w-16"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last Contact Days */}
                  <div>
                    <Label className="text-sm font-medium">Days Since Last Contact</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="number"
                        min="0"
                        value={filters.lastContactDays.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          lastContactDays: { ...prev.lastContactDays, min: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-20"
                      />
                      <span className="text-xs">to</span>
                      <Input
                        type="number"
                        min="0"
                        value={filters.lastContactDays.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          lastContactDays: { ...prev.lastContactDays, max: parseInt(e.target.value) || 365 }
                        }))}
                        className="w-20"
                      />
                    </div>
                  </div>

                  {/* Has Opportunities */}
                  <div>
                    <Label className="text-sm font-medium">Upcoming Opportunities</Label>
                    <Select value={filters.hasOpportunities?.toString() || 'all'} 
                            onValueChange={(value) => 
                              setFilters(prev => ({ 
                                ...prev, 
                                hasOpportunities: value === 'all' ? null : value === 'true' 
                              }))
                            }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All contacts</SelectItem>
                        <SelectItem value="true">Has opportunities</SelectItem>
                        <SelectItem value="false">No opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Affiliations */}
                  <div>
                    <Label className="text-sm font-medium">Affiliations</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {filterOptions.affiliations.map(affiliation => (
                        <div key={affiliation} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filters.affiliations.includes(affiliation)}
                            onCheckedChange={(checked) => 
                              updateArrayFilter('affiliations', affiliation, !!checked)
                            }
                          />
                          <span className="text-sm">{affiliation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="border-b p-4 bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={selectedContacts.length === filteredContacts.length ? "default" : "outline"}
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    <Checkbox 
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      className="mr-2"
                    />
                    Select All ({filteredContacts.length})
                  </Button>
                  
                  {selectedContacts.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="List name..."
                          value={listName}
                          onChange={(e) => setListName(e.target.value)}
                          className="w-40"
                        />
                        <Button size="sm" onClick={handleSaveList} disabled={!listName}>
                          <Save className="h-4 w-4 mr-1" />
                          Save List
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {selectedContacts.length > 0 && (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Bulk Action
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Saved Lists */}
              {savedLists.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Saved Lists</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {savedLists.map((list, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {list.name} ({list.contactIds.length})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {filteredContacts.map(contact => {
                  const isSelected = selectedContacts.includes(contact.id);
                  const daysSinceLastContact = contact.lastContact 
                    ? Math.floor((Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  return (
                    <Card 
                      key={contact.id} 
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}
                      onClick={() => handleContactSelect(contact.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Checkbox checked={isSelected} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium">{contact.name}</h3>
                                {contact.company && (
                                  <Badge variant="outline" className="text-xs">
                                    {contact.company}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{contact.email}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3" />
                                  <span>Coop: {contact.cooperationRating}/5</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>Potential: {contact.potentialScore}/5</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {daysSinceLastContact !== null 
                                      ? `${daysSinceLastContact}d ago`
                                      : 'Never contacted'
                                    }
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                {contact.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {contact.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{contact.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            {(contact.upcomingOpportunities?.length || 0) > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {contact.upcomingOpportunities!.length} upcoming
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsMode;