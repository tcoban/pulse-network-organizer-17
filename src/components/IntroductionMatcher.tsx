import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';
import { Users, ArrowRight, Gift, Sparkles, Building2 } from 'lucide-react';
import { ReferralTrackerDialog } from './ReferralTrackerDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  contactA: Contact; // Has need
  contactB: Contact | null; // Can fulfill need (null means organization)
  matchReason: string;
  confidence: 'high' | 'medium' | 'low';
  isOrganizationMatch?: boolean;
}

interface IntroductionMatcherProps {
  contacts: Contact[];
}

export function IntroductionMatcher({ contacts }: IntroductionMatcherProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [kofOffering, setKofOffering] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchKofOffering();
  }, []);

  useEffect(() => {
    if (kofOffering) {
      findMatches();
    }
  }, [contacts, kofOffering]);

  const fetchKofOffering = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'kof_offering')
        .single();

      if (error) throw error;
      if (data?.setting_value) {
        setKofOffering(data.setting_value as string);
      }
    } catch (error) {
      console.error('Error fetching KOF offering:', error);
    }
  };

  const findMatches = () => {
    const foundMatches: Match[] = [];

    // Find contacts with needs and contacts with offerings
    const contactsWithNeeds = contacts.filter(c => c.lookingFor?.trim());
    const contactsWithOfferings = contacts.filter(c => c.offering?.trim());

    // PRIORITY 1: Match contacts' needs with KOF's offering
    if (kofOffering) {
      const kofOfferingKeywords = kofOffering.toLowerCase().split(/\s+/);
      
      contactsWithNeeds.forEach(contact => {
        const needKeywords = contact.lookingFor!.toLowerCase().split(/\s+/);
        
        const matchingKeywords = needKeywords.filter(keyword => 
          keyword.length > 3 && kofOfferingKeywords.some(offer => 
            offer.includes(keyword) || keyword.includes(offer)
          )
        );

        if (matchingKeywords.length > 0) {
          const confidence = matchingKeywords.length >= 3 ? 'high' : 
                          matchingKeywords.length >= 2 ? 'medium' : 'low';
          
          foundMatches.push({
            contactA: contact,
            contactB: null, // Organization match
            matchReason: `${contact.name} is looking for services that KOF Institute can provide`,
            confidence,
            isOrganizationMatch: true
          });
        }
      });
    }

    // Simple keyword matching (can be enhanced with AI/NLP later)
    contactsWithNeeds.forEach(contactA => {
      const needKeywords = contactA.lookingFor!.toLowerCase().split(/\s+/);
      
      contactsWithOfferings.forEach(contactB => {
        if (contactA.id === contactB.id) return;
        
        const offeringKeywords = contactB.offering!.toLowerCase().split(/\s+/);
        
        // Check for keyword matches
        const matchingKeywords = needKeywords.filter(keyword => 
          keyword.length > 3 && offeringKeywords.some(offer => 
            offer.includes(keyword) || keyword.includes(offer)
          )
        );

        if (matchingKeywords.length > 0) {
          const confidence = matchingKeywords.length >= 3 ? 'high' : 
                          matchingKeywords.length >= 2 ? 'medium' : 'low';
          
          foundMatches.push({
            contactA,
            contactB,
            matchReason: `${contactA.name} is looking for "${contactA.lookingFor}" and ${contactB.name} offers "${contactB.offering}"`,
            confidence
          });
        }
      });
    });

    // Sort by: Organization matches first, then by confidence
    foundMatches.sort((a, b) => {
      if (a.isOrganizationMatch && !b.isOrganizationMatch) return -1;
      if (!a.isOrganizationMatch && b.isOrganizationMatch) return 1;
      
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    setMatches(foundMatches.slice(0, 10)); // Top 10 matches
  };

  const handleMakeIntroduction = (match: Match) => {
    setSelectedMatch(match);
    setShowReferralDialog(true);
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-500/10 text-green-700 border-green-500/20',
      medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    };
    return colors[confidence as keyof typeof colors] || colors.low;
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Introduction Matcher
          </CardTitle>
          <CardDescription>
            No potential introductions found yet. Add contacts with "Looking For" and "Offering" details to discover matches.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Introduction Matcher
          </CardTitle>
          <CardDescription>
            Found {matches.length} potential introduction{matches.length !== 1 ? 's' : ''} based on contact needs and offerings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.map((match, index) => (
            <div 
              key={index}
              className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {match.isOrganizationMatch && (
                    <Badge variant="default" className="bg-primary">
                      <Building2 className="h-3 w-3 mr-1" />
                      KOF Institute Match
                    </Badge>
                  )}
                  <Badge variant="outline" className={getConfidenceBadge(match.confidence)}>
                    {match.confidence} confidence
                  </Badge>
                  <Badge variant="secondary">
                    <Gift className="h-3 w-3 mr-1" />
                    Giver's Gain
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleMakeIntroduction(match)}
                >
                  Make Introduction
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">{match.contactA.name}</div>
                  <div className="text-xs text-muted-foreground">{match.contactA.company}</div>
                  <div className="text-xs text-foreground mt-1">
                    <span className="font-medium">Needs:</span> {match.contactA.lookingFor}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  {match.isOrganizationMatch ? (
                    <>
                      <div className="font-medium text-sm flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        KOF Institute
                      </div>
                      <div className="text-xs text-muted-foreground">Our Organization</div>
                      <div className="text-xs text-foreground mt-1">
                        <span className="font-medium">Offers:</span> {kofOffering.substring(0, 100)}...
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-sm">{match.contactB?.name}</div>
                      <div className="text-xs text-muted-foreground">{match.contactB?.company}</div>
                      <div className="text-xs text-foreground mt-1">
                        <span className="font-medium">Offers:</span> {match.contactB?.offering}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                <Users className="h-3 w-3 inline mr-1" />
                {match.matchReason}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedMatch && (
        <ReferralTrackerDialog
          open={showReferralDialog}
          onOpenChange={setShowReferralDialog}
          prefilledContact={selectedMatch.contactA}
          prefilledReferredTo={selectedMatch.isOrganizationMatch ? 'KOF Institute' : selectedMatch.contactB?.name || ''}
          prefilledCompany={selectedMatch.isOrganizationMatch ? 'KOF Institute' : selectedMatch.contactB?.company || ''}
          prefilledService={selectedMatch.isOrganizationMatch ? kofOffering : selectedMatch.contactB?.offering || ''}
        />
      )}
    </>
  );
}
