import React, { useState } from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  Building2, 
  Tag, 
  Heart, 
  Calendar,
  UserPlus,
  Bot,
  Loader2,
  Sparkles
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
}

interface LLMIntroductionAnalysisProps {
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onAddOpportunity: (contact: Contact) => void;
  onEditOpportunity: (opportunity: any, contact: Contact) => void;
}

const LLMIntroductionAnalysis: React.FC<LLMIntroductionAnalysisProps> = ({
  contacts,
  onEditContact,
  onDeleteContact,
  onViewDetails,
  onUpdateContact,
  onAddOpportunity,
  onEditOpportunity
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedPairs, setAnalyzedPairs] = useState<any[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const { toast } = useToast();

  const analyzeIntroductions = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-introduction-matches', {
        body: { contacts }
      });

      if (error) throw error;

      setAnalyzedPairs(data.pairs || []);
      setHasAnalyzed(true);
      
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
}) => {
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
      case 'follow-up-alerts': return <Calendar className="h-5 w-5" />;
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
    />;
  };

  const renderDefaultView = () => {
    if (['recent-interactions', 'companies', 'tags', 'auto-introductions'].includes(type)) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.history.back()}
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
      {renderIntroductionView()}
      {renderDefaultView()}
    </div>
  );
};