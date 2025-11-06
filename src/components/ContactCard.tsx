import { Contact } from '@/types/contact';
import { Opportunity, useOpportunities } from '@/hooks/useOpportunities';
import { getTypeColor } from '@/utils/opportunityHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { OpportunityDetails } from './OpportunityDetails';
import HistoryTabs from './HistoryTabs';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';
import { useState as useStateHook, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  FlipHorizontal,
  Gift,
  Linkedin,
  Mail, 
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Star,
  Target,
  User,
  UserCheck,
  Users,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
  onUpdateContact?: (contact: Contact) => void;
  onAddOpportunity?: () => void;
}

const ContactCard = ({ contact, onEdit, onDelete, onViewDetails, onUpdateContact, onAddOpportunity }: ContactCardProps) => {
  const [isFlipped, setIsFlipped] = useStateHook(false);
  const [selectedOpportunity, setSelectedOpportunity] = useStateHook<Opportunity | null>(null);
  const [showOpportunityDetails, setShowOpportunityDetails] = useStateHook(false);
  const [linkedGoals, setLinkedGoals] = useStateHook<Array<{ id: string; title: string; category: string; meetingCount: number }>>([]);
  const { teamMembers, getTeamMemberName } = useTeamMembers();
  const { opportunities, loading: opportunitiesLoading, syncOpportunityToCalendar } = useOpportunities(contact.id);
  const { goals: userGoals } = useGoals();

  // Fetch linked goals for this contact
  useEffect(() => {
    const fetchLinkedGoals = async () => {
      try {
        // Get all opportunities for this contact
        const { data: contactOpps } = await supabase
          .from('opportunities')
          .select('id')
          .eq('contact_id', contact.id);

        if (!contactOpps || contactOpps.length === 0) {
          setLinkedGoals([]);
          return;
        }

        const oppIds = contactOpps.map(o => o.id);

        // Get all meeting goals for these opportunities
        const { data: meetingGoals } = await supabase
          .from('meeting_goals')
          .select('user_goal_id')
          .in('opportunity_id', oppIds)
          .not('user_goal_id', 'is', null);

        if (!meetingGoals) {
          setLinkedGoals([]);
          return;
        }

        // Count meetings per goal
        const goalCounts = new Map<string, number>();
        meetingGoals.forEach(mg => {
          if (mg.user_goal_id) {
            goalCounts.set(mg.user_goal_id, (goalCounts.get(mg.user_goal_id) || 0) + 1);
          }
        });

        // Map to goal details
        const goalsData = Array.from(goalCounts.entries())
          .map(([goalId, count]) => {
            const goal = userGoals.find(g => g.id === goalId);
            return goal ? {
              id: goalId,
              title: goal.title,
              category: goal.category,
              meetingCount: count
            } : null;
          })
          .filter(Boolean) as Array<{ id: string; title: string; category: string; meetingCount: number }>;

        setLinkedGoals(goalsData);
      } catch (error) {
        console.error('Error fetching linked goals:', error);
      }
    };

    fetchLinkedGoals();
  }, [contact.id, userGoals, opportunities]);
  
  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowOpportunityDetails(true);
  };

  const handleSyncToCalendar = async (opportunityId: string) => {
    await syncOpportunityToCalendar(opportunityId);
  };

  const handleAssignmentChange = (newAssignee: string) => {
    if (!onUpdateContact) return;
    
    const updatedContact = {
      ...contact,
      assignedTo: newAssignee
    };
    
    onUpdateContact(updatedContact);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const formatOpportunityDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  const getLastInteraction = () => {
    if (contact.interactionHistory.length === 0) return null;
    return contact.interactionHistory.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  };

  const renderCooperationRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  const renderFrontView = () => (
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            {contact.avatar && <AvatarImage src={contact.avatar} alt={contact.name} />}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
            {contact.position && contact.company && (
              <p className="text-sm text-muted-foreground">
                {contact.position} at {contact.company}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsFlipped(true)}
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(contact)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(contact)}>
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(contact.id)}
                className="text-destructive"
              >
                Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {contact.email && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.affiliation && (
          <div className="flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2 text-accent-foreground" />
            <Badge variant="outline" className="text-xs font-medium">
              {contact.affiliation}
            </Badge>
          </div>
        )}
        
        {/* Assigned To */}
        <div className="flex items-center text-sm">
          <User className="h-4 w-4 mr-2 text-accent-foreground" />
          <span className="text-xs font-medium text-foreground mr-2">Assigned to:</span>
          <Select value={contact.assignedTo} onValueChange={handleAssignmentChange}>
            <SelectTrigger className="h-7 text-xs border-none bg-transparent p-0 hover:bg-muted/30">
              <SelectValue placeholder={getTeamMemberName(contact.assignedTo)} className="text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id} className="text-xs">
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Needs & Offers - BNI Integration */}
      {(contact.lookingFor || contact.offering) && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm font-medium mb-2 text-accent-foreground">
            <Gift className="h-4 w-4 mr-2" />
            Giver's Gain Opportunity
          </div>
          {contact.lookingFor && (
            <div className="text-xs mb-2">
              <span className="font-medium text-foreground">Looking for:</span>
              <p className="text-muted-foreground mt-1">{contact.lookingFor}</p>
            </div>
          )}
          {contact.offering && (
            <div className="text-xs">
              <span className="font-medium text-foreground">Offering:</span>
              <p className="text-muted-foreground mt-1">{contact.offering}</p>
            </div>
          )}
        </div>
      )}

      {/* Contributing to Goals */}
      {linkedGoals.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm font-medium mb-2">
            <Target className="h-4 w-4 mr-2" />
            Contributing to Goals
          </div>
          <div className="flex flex-wrap gap-1">
            {linkedGoals.map(goal => (
              <Badge key={goal.id} variant="outline" className="text-xs">
                {goal.title} • {goal.meetingCount} meeting{goal.meetingCount !== 1 ? 's' : ''}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Last Contact Details */}
      {(() => {
        const lastInteraction = getLastInteraction();
        return lastInteraction && (
          <div className="bg-muted/30 rounded-lg p-3 mb-4">
            <div className="flex items-center text-sm font-medium text-foreground mb-2">
              <Clock className="h-4 w-4 mr-2 text-accent-foreground" />
              Last Contact Details
            </div>
            <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-foreground">Contacted by:</span>
                  <span className="ml-1 text-muted-foreground">{getTeamMemberName(lastInteraction.contactedBy || '') || 'Unknown'}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Channel:</span>
                  <span className="ml-1 text-muted-foreground">{lastInteraction.channel || 'N/A'}</span>
                </div>
              </div>
              {lastInteraction.outcome && (
                <div>
                  <span className="font-medium text-foreground">Outcome:</span>
                  <span className="ml-1 text-muted-foreground">{lastInteraction.outcome}</span>
                </div>
              )}
              {lastInteraction.evaluation && (
                <div>
                  <span className="font-medium text-foreground">Evaluation:</span>
                  <span className="ml-1 text-muted-foreground">{lastInteraction.evaluation}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Next Contact Opportunities */}
      <div className="bg-accent/20 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-accent-foreground" />
            Next Contact Opportunities
          </div>
          {onAddOpportunity && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onAddOpportunity}
              className="h-6 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
        </div>
        {opportunitiesLoading ? (
          <p className="text-xs text-muted-foreground">Loading opportunities...</p>
        ) : opportunities.length > 0 ? (
            <div className="space-y-2">
              {opportunities.slice(0, 2).map((opportunity) => (
                <div 
                  key={opportunity.id} 
                  className="text-xs cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors"
                  onClick={() => handleOpportunityClick(opportunity)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground hover:text-primary">{opportunity.title}</span>
                    <span className="text-muted-foreground">{formatOpportunityDate(new Date(opportunity.date))}</span>
                  </div>
                  {opportunity.location && (
                    <div className="flex items-center mt-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{opportunity.location}</span>
                    </div>
                  )}
                </div>
              ))}
              {opportunities.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{opportunities.length - 2} more opportunities
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No opportunities scheduled yet.</p>
          )}
        </div>

      {/* Cooperation Level and Potential Score */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground mb-1">Cooperation Level</span>
          {renderCooperationRating(contact.cooperationRating)}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground mb-1">Potential Score</span>
          {renderCooperationRating(contact.potentialScore)}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Last contact: {formatDate(contact.lastContact)}
        </div>
        
        <div className="flex items-center space-x-1">
          {contact.socialLinks?.linkedin && (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Linkedin className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  );

  const renderBackView = () => (
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            {contact.avatar && <AvatarImage src={contact.avatar} alt={contact.name} />}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
            <p className="text-sm text-accent-foreground font-medium">Detailed Information</p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsFlipped(false)}
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        {contact.phone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.company && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            <span>{contact.company}</span>
          </div>
        )}
      </div>

      {/* Historical Data Section */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-3">
          <Clock className="h-4 w-4 mr-2 text-accent-foreground" />
          <span className="font-medium text-sm text-foreground">Contact History</span>
        </div>
        <HistoryTabs contact={contact} />
      </div>

      {/* Quick Stats */}
      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded p-2">
            <div className="text-xs font-medium text-foreground">{contact.interactionHistory.length}</div>
            <div className="text-xs text-muted-foreground">Interactions</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-xs font-medium text-foreground">{contact.eventParticipationHistory.length}</div>
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-xs font-medium text-foreground">{contact.pastCollaborations.length}</div>
            <div className="text-xs text-muted-foreground">Collaborations</div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-3 mt-4 border-t pt-4">
        {contact.referredBy && (
          <div className="flex items-start text-sm">
            <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">Referred by: </span>
              <span className="text-muted-foreground">{contact.referredBy}</span>
            </div>
          </div>
        )}

        {contact.offering && (
          <div className="flex items-start text-sm">
            <Gift className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">Offering: </span>
              <span className="text-muted-foreground">{contact.offering}</span>
            </div>
          </div>
        )}

        {contact.lookingFor && (
          <div className="flex items-start text-sm">
            <Search className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">Looking for: </span>
              <span className="text-muted-foreground">{contact.lookingFor}</span>
            </div>
          </div>
        )}
      </div>

      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {contact.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {contact.notes && (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
          <span className="font-medium text-foreground">Notes: </span>
          {contact.notes}
        </div>
      )}
    </CardContent>
  );

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      {isFlipped ? renderBackView() : renderFrontView()}
      
      {selectedOpportunity && (
        <OpportunityDetails
          opportunity={selectedOpportunity}
          contactId={contact.id}
          isOpen={showOpportunityDetails}
          onClose={() => {
            setShowOpportunityDetails(false);
            setSelectedOpportunity(null);
          }}
        />
      )}
    </Card>
  );
};

export default ContactCard;