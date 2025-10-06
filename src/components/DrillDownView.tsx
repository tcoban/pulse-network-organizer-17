import React, { useState } from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  Building2, 
  Tag, 
  Heart, 
  Calendar,
  UserPlus,
  Bot,
  Loader2,
  Sparkles,
  Clock
} from 'lucide-react';
import ContactCard from './ContactCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

export type DrillDownType = 'recent-interactions' | 'companies' | 'tags' | 'open-matches' | 're-engagement' | 'auto-introductions' | 'follow-up-alerts' | 'opportunity-matches';

interface DrillDownViewProps {
  type: DrillDownType;
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onAddOpportunity: (contact: Contact) => void;
  onEditOpportunity: (opportunity: any, contact: Contact) => void;
  onBack?: () => void;
  onAnalysisComplete?: (count: number) => void;
}

interface LLMIntroductionAnalysisProps {
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onAddOpportunity: (contact: Contact) => void;
  onEditOpportunity: (opportunity: any, contact: Contact) => void;
  onAnalysisComplete?: (count: number) => void;
}

const LLMIntroductionAnalysis: React.FC<LLMIntroductionAnalysisProps> = ({
  contacts,
  onEditContact,
  onDeleteContact,
  onViewDetails,
  onUpdateContact,
  onAddOpportunity,
  onEditOpportunity,
  onAnalysisComplete
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedPairs, setAnalyzedPairs] = useState<any[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const { toast } = useToast();

  const analyzeIntroductions = async () => {
    setAnalyzing(true);
    
    // Show immediate feedback
    toast({
      title: "AI Analysis Starting",
      description: `Analyzing ${contacts.length} contacts with Lovable AI...`,
    });

    try {
      const { data, error } = await supabase.functions.invoke('analyze-introduction-matches', {
        body: { contacts }
      });

      if (error) {
        // Better error handling
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limit Reached",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Credits Needed",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setAnalyzedPairs(data.pairs || []);
      setHasAnalyzed(true);
      
      // Success feedback
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.pairs?.length || 0} potential matches`,
      });
      
      // Notify parent component of the analysis result
      onAnalysisComplete?.(data.pairs?.length || 0);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${data.pairs?.length || 0} high-quality introduction opportunities using AI analysis.`,
      });
    } catch (error) {
      console.error('Error analyzing introductions:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze contacts for introductions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartIntroductions = (pairs: any[]) => {
    console.log('Starting AI introductions for', pairs.length, 'pairs');
    toast({
      title: "AI Introductions Started",
      description: `Preparing ${pairs.length} intelligent introductions. You'll receive drafts shortly.`,
    });
  };

  const handleSingleIntroduction = (pair: any) => {
    console.log('Making introduction between', pair.contact1.name, 'and', pair.contact2.name);
    toast({
      title: "Introduction Prepared",
      description: `Smart introduction between ${pair.contact1.name} and ${pair.contact2.name} is being drafted.`,
    });
  };

  const handleSkipIntroduction = (pair: any) => {
    console.log('Skipping introduction between', pair.contact1.name, 'and', pair.contact2.name);
    setAnalyzedPairs(prev => prev.filter(p => p !== pair));
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'need-offering': return 'bg-green-100 text-green-800 border-green-200';
      case 'business-synergy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'professional-alignment': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'project-collaboration': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'network-expansion': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!hasAnalyzed) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Introduction Engine
            </CardTitle>
            <CardDescription>
              Advanced contextual analysis using LLM to find meaningful connections between your contacts.
              This goes beyond simple keyword matching to understand semantic relationships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white/50 rounded-lg p-4 border border-primary/10">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  What makes this smart?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Contextual understanding of offerings and needs</li>
                  <li>• Business synergy detection</li>
                  <li>• Professional alignment assessment</li>
                  <li>• Confidence scoring for each match</li>
                </ul>
              </div>
              
              <Button 
                className="w-full" 
                onClick={analyzeIntroductions}
                disabled={analyzing || contacts.length < 2}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start AI Analysis ({contacts.length} contacts)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis Results
          </CardTitle>
          <CardDescription>
            {analyzedPairs.length > 0 
              ? `Found ${analyzedPairs.length} high-quality introduction opportunities`
              : "No strong matches found with current contact data"
            }
          </CardDescription>
        </CardHeader>
        {analyzedPairs.length > 0 && (
          <CardContent>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => handleStartIntroductions(analyzedPairs)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Start All AI Introductions ({analyzedPairs.length})
              </Button>
              <Button variant="outline" onClick={() => setHasAnalyzed(false)}>
                Re-analyze
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {analyzedPairs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Matches Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI couldn't find introduction opportunities with the current contact data. 
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 max-w-md mx-auto">
              <strong>Tip:</strong> Add more detailed "offering" and "looking for" information to your contacts.
              The AI now finds matches with 30%+ confidence, including weaker connections that might still have networking value.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyzedPairs.map((pair, index) => (
            <Card key={`${pair.contact1.id}-${pair.contact2.id}`} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">AI Match #{index + 1}</CardTitle>
                    <CardDescription className="mt-2">
                      {pair.matchReason}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getMatchTypeColor(pair.matchType)}>
                      {pair.matchType.replace('-', ' ')}
                    </Badge>
                    <Badge variant="secondary">
                      {pair.matchScore}% confidence
                    </Badge>
                    {pair.interpretation && (
                      <div className="text-xs text-muted-foreground mt-1 max-w-xs">
                        {pair.interpretation}
                      </div>
                    )}
                  </div>
                </div>
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
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleSingleIntroduction(pair)} className="flex-1">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Make This Introduction
                  </Button>
                  <Button variant="outline" onClick={() => handleSkipIntroduction(pair)}>
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const DrillDownView: React.FC<DrillDownViewProps> = ({
  type,
  contacts,
  onEditContact,
  onDeleteContact,
  onViewDetails,
  onUpdateContact,
  onAddOpportunity,
  onEditOpportunity,
  onBack,
  onAnalysisComplete,
}) => {
  const { toast } = useToast();

  const getTitle = () => {
    switch (type) {
      case 'recent-interactions': return 'Recent Interactions';
      case 'companies': return 'Companies';
      case 'tags': return 'Tags';
      case 'open-matches': return 'Open Matches';
      case 're-engagement': return 'Re-engagement Needed';
      case 'auto-introductions': return 'Auto-Introduction Ready';
      case 'follow-up-alerts': return 'Follow-up Alerts';
      case 'opportunity-matches': return 'Opportunity Matches';
      default: return 'Contacts';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'recent-interactions': return <Calendar className="h-5 w-5" />;
      case 'companies': return <Building2 className="h-5 w-5" />;
      case 'tags': return <Tag className="h-5 w-5" />;
      case 'open-matches': return <Users className="h-5 w-5" />;
      case 're-engagement': return <Heart className="h-5 w-5" />;
      case 'auto-introductions': return <UserPlus className="h-5 w-5" />;
      case 'follow-up-alerts': return <Clock className="h-5 w-5" />;
      case 'opportunity-matches': return <Users className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const renderRecentInteractionsView = () => {
    if (type !== 'recent-interactions') return null;

    const recentContacts = contacts.filter(contact => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return contact.interactionHistory.some(interaction => 
        new Date(interaction.date) >= thirtyDaysAgo
      );
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentContacts.map(contact => (
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
    );
  };

  const renderCompaniesView = () => {
    if (type !== 'companies') return null;

    const companiesMap = new Map<string, Contact[]>();
    contacts.forEach(contact => {
      const company = contact.company || 'No Company';
      if (!companiesMap.has(company)) {
        companiesMap.set(company, []);
      }
      companiesMap.get(company)!.push(contact);
    });

    return (
      <div className="space-y-4">
        {Array.from(companiesMap.entries())
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([company, companyContacts]) => (
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
                {companyContacts.slice(0, 6).map(contact => (
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
              {companyContacts.length > 6 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  And {companyContacts.length - 6} more contacts...
                </div>
              )}
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

  const renderFollowUpAlertsView = () => {
    if (type !== 'follow-up-alerts') return null;

    // Categorize contacts by urgency
    const now = Date.now();
    const categorizedContacts = contacts.map(contact => {
      const daysSinceContact = contact.lastContact 
        ? Math.floor((now - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      let urgency: 'critical' | 'high' | 'medium' | 'never-contacted' = 'medium';
      let urgencyColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      
      if (!contact.lastContact) {
        urgency = 'never-contacted';
        urgencyColor = 'bg-red-100 text-red-800 border-red-200';
      } else if (daysSinceContact && daysSinceContact > 365) {
        urgency = 'critical';
        urgencyColor = 'bg-red-100 text-red-800 border-red-200';
      } else if (daysSinceContact && daysSinceContact > 180) {
        urgency = 'high';
        urgencyColor = 'bg-orange-100 text-orange-800 border-orange-200';
      }

      return {
        ...contact,
        daysSinceContact,
        urgency,
        urgencyColor
      };
    }).sort((a, b) => {
      // Sort by urgency, then by days since contact
      const urgencyOrder = { 'never-contacted': 0, 'critical': 1, 'high': 2, 'medium': 3 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      
      if (!a.daysSinceContact && !b.daysSinceContact) return 0;
      if (!a.daysSinceContact) return -1;
      if (!b.daysSinceContact) return 1;
      return b.daysSinceContact - a.daysSinceContact;
    });

    const handleMarkAsContacted = async (contact: Contact) => {
      const updatedContact = {
        ...contact,
        lastContact: new Date(),
        interactionHistory: [
          ...contact.interactionHistory,
          {
            id: `interaction-${Date.now()}`,
            type: 'other' as const,
            date: new Date(),
            description: 'Follow-up contact made',
            outcome: 'Completed follow-up outreach',
            contactedBy: 'Current user',
            channel: 'Manual entry'
          }
        ]
      };
      
      await onUpdateContact(updatedContact);
      toast({
        title: "Contact Updated",
        description: `Marked ${contact.name} as contacted today.`,
      });
    };

    return (
      <div className="space-y-6">
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Follow-up Alert Summary
            </CardTitle>
            <CardDescription>
              Contacts are categorized by how long since last interaction. Prioritize never-contacted and critical alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {categorizedContacts.filter(c => c.urgency === 'never-contacted').length}
                </div>
                <div className="text-sm text-muted-foreground">Never Contacted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {categorizedContacts.filter(c => c.urgency === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical (1+ years)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {categorizedContacts.filter(c => c.urgency === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High (6+ months)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {categorizedContacts.filter(c => c.urgency === 'medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Medium (3+ months)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {categorizedContacts.map(contact => (
            <Card key={contact.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={contact.urgencyColor}>
                          {contact.urgency.replace('-', ' ')}
                        </Badge>
                        {contact.daysSinceContact ? (
                          <span className="text-sm text-muted-foreground">
                            Last contacted {contact.daysSinceContact} days ago
                          </span>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">
                            Never contacted
                          </span>
                        )}
                      </div>

                      {contact.notes && (
                        <div className="mt-2 text-sm text-muted-foreground bg-muted/30 rounded p-2">
                          <strong>Notes:</strong> {contact.notes}
                        </div>
                      )}

                      <div className="mt-3 text-sm">
                        <strong>Follow-up suggestions:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          {contact.urgency === 'never-contacted' && (
                            <>
                              <li>• Send initial introduction email</li>
                              <li>• Connect on LinkedIn</li>
                              <li>• Schedule a brief introductory call</li>
                            </>
                          )}
                          {contact.urgency === 'critical' && (
                            <>
                              <li>• Send re-engagement email with value proposition</li>
                              <li>• Share relevant industry updates</li>
                              <li>• Propose coffee meeting or call</li>
                            </>
                          )}
                          {(contact.urgency === 'high' || contact.urgency === 'medium') && (
                            <>
                              <li>• Send friendly check-in message</li>
                              <li>• Share relevant opportunities or insights</li>
                              <li>• Invite to upcoming events</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsContacted(contact)}
                      className="whitespace-nowrap"
                    >
                      Mark as Contacted
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddOpportunity(contact)}
                      className="whitespace-nowrap"
                    >
                      Schedule Follow-up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditContact(contact)}
                      className="whitespace-nowrap"
                    >
                      Edit Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderIntroductionView = () => {
    if (type !== 'auto-introductions') return null;

    return <LLMIntroductionAnalysis 
      contacts={contacts} 
      onUpdateContact={onUpdateContact} 
      onEditContact={onEditContact} 
      onDeleteContact={onDeleteContact} 
      onViewDetails={onViewDetails} 
      onAddOpportunity={onAddOpportunity} 
      onEditOpportunity={onEditOpportunity}
      onAnalysisComplete={onAnalysisComplete}
    />;
  };

  const renderDefaultView = () => {
    if (['recent-interactions', 'companies', 'tags', 'auto-introductions', 'follow-up-alerts'].includes(type)) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map(contact => (
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
    );
  };

  const renderOpportunityMatchesView = () => {
    if (type !== 'opportunity-matches') return null;

    // Find contacts with offerings and those looking for things
    const contactsWithOfferings = contacts.filter(contact => contact.offering && contact.offering.trim());
    const contactsWithNeeds = contacts.filter(contact => contact.lookingFor && contact.lookingFor.trim());

    // Create potential matches where one contact's offering might match another's need
    const potentialMatches: Array<{
      contact1: Contact;
      contact2: Contact;
      matchType: 'offering-to-need' | 'mutual-benefit';
      confidence: number;
      reason: string;
    }> = [];

    // Simple keyword-based matching
    contactsWithOfferings.forEach(offeringContact => {
      contactsWithNeeds.forEach(needContact => {
        if (offeringContact.id === needContact.id) return; // Skip same contact
        
        const offering = offeringContact.offering?.toLowerCase() || '';
        const need = needContact.lookingFor?.toLowerCase() || '';
        
        // Simple keyword overlap detection
        const offeringWords = offering.split(/\s+/).filter(word => word.length > 2);
        const needWords = need.split(/\s+/).filter(word => word.length > 2);
        
        const commonWords = offeringWords.filter(word => 
          needWords.some(needWord => 
            needWord.includes(word) || word.includes(needWord) ||
            (word.length > 3 && needWord.length > 3 && 
             (word.startsWith(needWord.substring(0, 3)) || needWord.startsWith(word.substring(0, 3))))
          )
        );

        if (commonWords.length > 0) {
          let confidence = Math.min(90, (commonWords.length / Math.max(offeringWords.length, needWords.length)) * 100);
          
          // Check for mutual benefit (both have offerings and needs that might match)
          let matchType: 'offering-to-need' | 'mutual-benefit' = 'offering-to-need';
          if (needContact.offering && offeringContact.lookingFor) {
            const reverseOffering = needContact.offering.toLowerCase();
            const reverseLookingFor = offeringContact.lookingFor.toLowerCase();
            const reverseOfferingWords = reverseOffering.split(/\s+/).filter(word => word.length > 2);
            const reverseLookingWords = reverseLookingFor.split(/\s+/).filter(word => word.length > 2);
            
            const reverseCommonWords = reverseOfferingWords.filter(word => 
              reverseLookingWords.some(lookingWord => 
                lookingWord.includes(word) || word.includes(lookingWord)
              )
            );
            
            if (reverseCommonWords.length > 0) {
              matchType = 'mutual-benefit';
              confidence = Math.min(95, confidence + 20);
            }
          }

          potentialMatches.push({
            contact1: offeringContact,
            contact2: needContact,
            matchType,
            confidence: Math.round(confidence),
            reason: `${offeringContact.name} offers "${offeringContact.offering}" which may help ${needContact.name} who is looking for "${needContact.lookingFor}"`
          });
        }
      });
    });

    // Remove duplicates and sort by confidence
    const uniqueMatches = potentialMatches
      .filter((match, index, self) => 
        index === self.findIndex(m => 
          (m.contact1.id === match.contact1.id && m.contact2.id === match.contact2.id) ||
          (m.contact1.id === match.contact2.id && m.contact2.id === match.contact1.id)
        )
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Limit to top 20 matches

    const summaryStats = {
      total: uniqueMatches.length,
      highConfidence: uniqueMatches.filter(m => m.confidence >= 70).length,
      mediumConfidence: uniqueMatches.filter(m => m.confidence >= 50 && m.confidence < 70).length,
      mutualBenefit: uniqueMatches.filter(m => m.matchType === 'mutual-benefit').length
    };

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{summaryStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summaryStats.highConfidence}</div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{summaryStats.mediumConfidence}</div>
              <div className="text-sm text-muted-foreground">Medium Confidence</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{summaryStats.mutualBenefit}</div>
              <div className="text-sm text-muted-foreground">Mutual Benefit</div>
            </CardContent>
          </Card>
        </div>

        {uniqueMatches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Opportunity Matches Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No matches found between contact offerings and needs.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 max-w-md mx-auto">
                <strong>Tip:</strong> Add "offering" and "looking for" information to your contacts to discover networking opportunities.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {uniqueMatches.map((match, index) => (
              <Card key={`${match.contact1.id}-${match.contact2.id}`} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Match #{index + 1}</CardTitle>
                      <CardDescription className="mt-2">
                        {match.reason}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={
                        match.matchType === 'mutual-benefit' 
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }>
                        {match.matchType === 'mutual-benefit' ? 'Mutual Benefit' : 'One-Way Match'}
                      </Badge>
                      <Badge variant={match.confidence >= 70 ? 'default' : match.confidence >= 50 ? 'secondary' : 'outline'}>
                        {match.confidence}% match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">
                        {match.contact1.offering ? 'Can Offer' : 'Contact'}
                      </h4>
                      <ContactCard
                        contact={match.contact1}
                        onEdit={onEditContact}
                        onDelete={onDeleteContact}
                        onViewDetails={onViewDetails}
                        onUpdateContact={onUpdateContact}
                        onAddOpportunity={() => onAddOpportunity(match.contact1)}
                        onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, match.contact1)}
                      />
                      {match.contact1.offering && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <strong>Offers:</strong> {match.contact1.offering}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">
                        {match.contact2.lookingFor ? 'Looking For' : 'Contact'}
                      </h4>
                      <ContactCard
                        contact={match.contact2}
                        onEdit={onEditContact}
                        onDelete={onDeleteContact}
                        onViewDetails={onViewDetails}
                        onUpdateContact={onUpdateContact}
                        onAddOpportunity={() => onAddOpportunity(match.contact2)}
                        onEditOpportunity={(opportunity) => onEditOpportunity(opportunity, match.contact2)}
                      />
                      {match.contact2.lookingFor && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <strong>Needs:</strong> {match.contact2.lookingFor}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => {
                      toast({
                        title: "Introduction Noted",
                        description: `Potential introduction between ${match.contact1.name} and ${match.contact2.name} has been noted.`,
                      });
                    }} className="flex-1">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Consider Introduction
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Added to Watch List",
                        description: "This match has been added to your watch list for future consideration.",
                      });
                    }}>
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack || (() => window.history.back())}
          className="mr-4"
        >
          ← Back
        </Button>
        {getIcon()}
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <Badge variant="secondary">{contacts.length} total</Badge>
      </div>

      {renderRecentInteractionsView()}
      {renderCompaniesView()}
      {renderTagsView()}
      {renderFollowUpAlertsView()}
      {renderIntroductionView()}
      {renderOpportunityMatchesView()}
      {renderDefaultView()}
    </div>
  );
};