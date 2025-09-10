import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Brain, Route, Users, Zap } from 'lucide-react';
import { Contact } from '@/types/contact';

interface AdvancedSearchProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

const AdvancedSearch = ({ contacts, onSelectContact }: AdvancedSearchProps) => {
  const [semanticQuery, setSemanticQuery] = useState('');
  const [pathQuery, setPathQuery] = useState('');
  const [expertiseQuery, setExpertiseQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<Contact[]>([]);
  const [pathResults, setPathResults] = useState<Array<{ path: Contact[]; distance: number }>>([]);
  const [expertiseResults, setExpertiseResults] = useState<Contact[]>([]);

  const performSemanticSearch = () => {
    if (!semanticQuery.trim()) return;

    // Simple semantic search using keyword matching with context
    const results = contacts.filter(contact => {
      const searchFields = [
        contact.name,
        contact.company,
        contact.position,
        contact.notes,
        contact.offering,
        contact.lookingFor,
        contact.currentProjects,
        contact.affiliation,
        ...contact.tags,
      ].join(' ').toLowerCase();

      const queryWords = semanticQuery.toLowerCase().split(' ');
      
      // Score based on relevance
      const score = queryWords.reduce((acc, word) => {
        if (searchFields.includes(word)) {
          acc += 1;
        }
        // Bonus for exact phrase matches
        if (searchFields.includes(semanticQuery.toLowerCase())) {
          acc += 2;
        }
        return acc;
      }, 0);

      return score > 0;
    });

    // Sort by relevance (simple scoring)
    results.sort((a, b) => {
      const aScore = calculateRelevanceScore(a, semanticQuery);
      const bScore = calculateRelevanceScore(b, semanticQuery);
      return bScore - aScore;
    });

    setSemanticResults(results.slice(0, 10));
  };

  const performPathSearch = () => {
    if (!pathQuery.trim()) return;

    // Find connections to specific organizations or people
    const targetKeywords = pathQuery.toLowerCase().split(' ');
    const paths: Array<{ path: Contact[]; distance: number }> = [];

    contacts.forEach(contact => {
      // Direct connection (distance 1)
      if (matchesTarget(contact, targetKeywords)) {
        paths.push({ path: [contact], distance: 1 });
      }

      // 2-degree connection
      contact.linkedinConnections?.forEach(connectionName => {
        const connectionContact = contacts.find(c => 
          c.name.toLowerCase().includes(connectionName.toLowerCase())
        );
        
        if (connectionContact && matchesTarget(connectionContact, targetKeywords)) {
          paths.push({ 
            path: [contact, connectionContact], 
            distance: 2 
          });
        }
      });
    });

    // Remove duplicates and sort by distance
    const uniquePaths = paths.filter((path, index, self) => 
      index === self.findIndex(p => 
        p.path[p.path.length - 1].id === path.path[path.path.length - 1].id
      )
    );

    uniquePaths.sort((a, b) => a.distance - b.distance);
    setPathResults(uniquePaths.slice(0, 5));
  };

  const performExpertiseSearch = () => {
    if (!expertiseQuery.trim()) return;

    const keywords = expertiseQuery.toLowerCase().split(' ');
    const results = contacts.filter(contact => {
      const expertiseFields = [
        contact.offering,
        contact.currentProjects,
        contact.position,
        contact.company,
        ...contact.tags,
      ].join(' ').toLowerCase();

      return keywords.some(keyword => 
        expertiseFields.includes(keyword) || 
        contact.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    });

    // Sort by expertise relevance
    results.sort((a, b) => {
      const aScore = calculateExpertiseScore(a, keywords);
      const bScore = calculateExpertiseScore(b, keywords);
      return bScore - aScore;
    });

    setExpertiseResults(results.slice(0, 10));
  };

  const calculateRelevanceScore = (contact: Contact, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Higher weight for name and company matches
    if (contact.name.toLowerCase().includes(queryLower)) score += 10;
    if (contact.company?.toLowerCase().includes(queryLower)) score += 8;
    
    // Medium weight for position and offering
    if (contact.position?.toLowerCase().includes(queryLower)) score += 6;
    if (contact.offering?.toLowerCase().includes(queryLower)) score += 6;
    
    // Lower weight for notes and other fields
    if (contact.notes.toLowerCase().includes(queryLower)) score += 3;
    if (contact.lookingFor?.toLowerCase().includes(queryLower)) score += 3;
    
    // Bonus for high cooperation and potential scores
    score += contact.cooperationRating * 0.5;
    score += contact.potentialScore * 0.5;

    return score;
  };

  const calculateExpertiseScore = (contact: Contact, keywords: string[]): number => {
    let score = 0;

    keywords.forEach(keyword => {
      // Direct tag match
      if (contact.tags.some(tag => tag.toLowerCase().includes(keyword))) {
        score += 10;
      }
      
      // Offering match
      if (contact.offering?.toLowerCase().includes(keyword)) {
        score += 8;
      }
      
      // Position match
      if (contact.position?.toLowerCase().includes(keyword)) {
        score += 6;
      }
      
      // Current projects match
      if (contact.currentProjects?.toLowerCase().includes(keyword)) {
        score += 5;
      }
    });

    return score;
  };

  const matchesTarget = (contact: Contact, keywords: string[]): boolean => {
    const searchText = [
      contact.name,
      contact.company,
      contact.affiliation,
    ].join(' ').toLowerCase();

    return keywords.some(keyword => searchText.includes(keyword));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Advanced Search & Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="semantic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semantic" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Semantic
            </TabsTrigger>
            <TabsTrigger value="path" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Relationship Path
            </TabsTrigger>
            <TabsTrigger value="expertise" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Expertise Matching
            </TabsTrigger>
          </TabsList>

          <TabsContent value="semantic" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Who can help with inflation forecasting?"
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
              />
              <Button onClick={performSemanticSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {semanticResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Search Results</h4>
                {semanticResults.map(contact => (
                  <div 
                    key={contact.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => onSelectContact(contact)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{contact.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {contact.position} at {contact.company}
                        </p>
                        {contact.offering && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Offers: {contact.offering}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline">Score: {contact.cooperationRating}/5</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="path" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="How can I reach the SNB via 2 connections?"
                value={pathQuery}
                onChange={(e) => setPathQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performPathSearch()}
              />
              <Button onClick={performPathSearch}>
                <Route className="h-4 w-4" />
              </Button>
            </div>
            
            {pathResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Connection Paths</h4>
                {pathResults.map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{result.distance} degree{result.distance > 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.path.map((contact, contactIndex) => (
                        <div key={contact.id} className="flex items-center">
                          <span 
                            className="text-sm font-medium cursor-pointer hover:underline"
                            onClick={() => onSelectContact(contact)}
                          >
                            {contact.name}
                          </span>
                          {contactIndex < result.path.length - 1 && (
                            <span className="mx-2 text-muted-foreground">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expertise" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Find IoT experts in Swiss manufacturing"
                value={expertiseQuery}
                onChange={(e) => setExpertiseQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performExpertiseSearch()}
              />
              <Button onClick={performExpertiseSearch}>
                <Users className="h-4 w-4" />
              </Button>
            </div>
            
            {expertiseResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Expertise Matches</h4>
                {expertiseResults.map(contact => (
                  <div 
                    key={contact.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => onSelectContact(contact)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium">{contact.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {contact.position} at {contact.company}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {contact.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">Coop: {contact.cooperationRating}/5</Badge>
                        <Badge variant="outline">Potential: {contact.potentialScore}/5</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;