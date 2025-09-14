import { Contact } from '@/types/contact';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Coffee,
  Users,
  Star,
  Award,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface HistoryTabsProps {
  contact: Contact;
}

const HistoryTabs = ({ contact }: HistoryTabsProps) => {
  const { getTeamMemberName } = useTeamMembers();

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-3 w-3" />;
      case 'call': return <Phone className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'coffee': return <Coffee className="h-3 w-3" />;
      case 'event': return <Calendar className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'text-blue-600 bg-blue-50';
      case 'call': return 'text-green-600 bg-green-50';
      case 'email': return 'text-purple-600 bg-purple-50';
      case 'coffee': return 'text-orange-600 bg-orange-50';
      case 'event': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getParticipationTypeColor = (type?: string) => {
    switch (type) {
      case 'speaker': return 'text-red-600 bg-red-50';
      case 'organizer': return 'text-purple-600 bg-purple-50';
      case 'panelist': return 'text-blue-600 bg-blue-50';
      case 'attendee': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
  };

  return (
    <Tabs defaultValue="interactions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="interactions" className="text-xs">
          Interactions ({contact.interactionHistory.length})
        </TabsTrigger>
        <TabsTrigger value="events" className="text-xs">
          Events ({contact.eventParticipationHistory.length})
        </TabsTrigger>
        <TabsTrigger value="collaborations" className="text-xs">
          Collaborations ({contact.pastCollaborations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="interactions" className="mt-3">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contact.interactionHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No interactions recorded</p>
          ) : (
            contact.interactionHistory
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((interaction) => (
                <Card key={interaction.id} className="border border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${getInteractionColor(interaction.type)}`}>
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {interaction.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(interaction.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-foreground mb-2">{interaction.description}</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="font-medium text-foreground">By:</span>
                          <span className="ml-1 text-muted-foreground">
                            {getTeamMemberName(interaction.contactedBy || '') || 'Unknown'}
                          </span>
                        </div>
                        {interaction.channel && (
                          <div>
                            <span className="font-medium text-foreground">Channel:</span>
                            <span className="ml-1 text-muted-foreground">{interaction.channel}</span>
                          </div>
                        )}
                      </div>
                      
                      {interaction.outcome && (
                        <div className="text-xs">
                          <span className="font-medium text-foreground">Outcome:</span>
                          <span className="ml-1 text-muted-foreground">{interaction.outcome}</span>
                        </div>
                      )}
                      
                      {interaction.evaluation && (
                        <div className="text-xs">
                          <span className="font-medium text-foreground">Evaluation:</span>
                          <span className="ml-1 text-muted-foreground">{interaction.evaluation}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="events" className="mt-3">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contact.eventParticipationHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No events recorded</p>
          ) : (
            contact.eventParticipationHistory
              .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
              .map((event) => (
                <Card key={event.id} className="border border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent-foreground" />
                        <span className="font-medium text-sm text-foreground">{event.eventName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.eventDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.eventType}
                        </Badge>
                        {event.participationType && (
                          <Badge variant="outline" className={`text-xs capitalize ${getParticipationTypeColor(event.participationType)}`}>
                            {event.participationType}
                          </Badge>
                        )}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.notes && (
                        <p className="text-xs text-muted-foreground">{event.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="collaborations" className="mt-3">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contact.pastCollaborations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No collaborations recorded</p>
          ) : (
            contact.pastCollaborations
              .sort((a, b) => {
                const aDate = a.endDate || a.startDate;
                const bDate = b.endDate || b.startDate;
                if (!aDate || !bDate) return 0;
                return new Date(bDate).getTime() - new Date(aDate).getTime();
              })
              .map((collab) => (
                <Card key={collab.id} className="border border-border/40">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-accent-foreground" />
                        <span className="font-medium text-sm text-foreground">{collab.projectName}</span>
                      </div>
                      {collab.successRating && renderStars(collab.successRating)}
                    </div>
                    
                    {collab.description && (
                      <p className="text-xs text-muted-foreground mb-2">{collab.description}</p>
                    )}
                    
                    <div className="space-y-1">
                      {(collab.startDate || collab.endDate) && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {collab.startDate && format(new Date(collab.startDate), 'MMM yyyy')}
                            {collab.startDate && collab.endDate && ' - '}
                            {collab.endDate && format(new Date(collab.endDate), 'MMM yyyy')}
                          </span>
                        </div>
                      )}
                      
                      {collab.outcome && (
                        <div className="text-xs">
                          <span className="font-medium text-foreground">Outcome:</span>
                          <span className="ml-1 text-muted-foreground">{collab.outcome}</span>
                        </div>
                      )}
                      
                      {collab.createdBy && (
                        <div className="text-xs">
                          <span className="font-medium text-foreground">Created by:</span>
                          <span className="ml-1 text-muted-foreground">
                            {getTeamMemberName(collab.createdBy) || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default HistoryTabs;