import { Contact, ContactOpportunity } from '@/types/contact';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { OpportunityDetails } from './OpportunityDetails';
import { useTeamMembers } from '@/hooks/useTeamMembers';
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
  onEditOpportunity?: (opportunity: ContactOpportunity) => void;
}

const ContactCard = ({ contact, onEdit, onDelete, onViewDetails, onUpdateContact, onAddOpportunity, onEditOpportunity }: ContactCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ContactOpportunity | null>(null);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const { teamMembers, getTeamMemberName } = useTeamMembers();
  const handleOpportunityClick = (opportunity: ContactOpportunity) => {
    if (onEditOpportunity) {
      onEditOpportunity(opportunity);
    } else {
      setSelectedOpportunity(opportunity);
      setIsOpportunityDialogOpen(true);
    }
  };

  const handleOpportunitySave = (updatedOpportunity: ContactOpportunity) => {
    if (!onUpdateContact) return;
    
    const updatedContact = {
      ...contact,
      upcomingOpportunities: contact.upcomingOpportunities?.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ) || []
    };
    
    onUpdateContact(updatedContact);
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
        {contact.upcomingOpportunities && contact.upcomingOpportunities.length > 0 ? (
            <div className="space-y-2">
              {contact.upcomingOpportunities.slice(0, 2).map((opportunity) => (
                <div 
                  key={opportunity.id} 
                  className="text-xs cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors"
                  onClick={() => handleOpportunityClick(opportunity)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground hover:text-primary">{opportunity.title}</span>
                    <span className="text-muted-foreground">{formatOpportunityDate(opportunity.date)}</span>
                  </div>
                  {opportunity.location && (
                    <div className="flex items-center mt-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{opportunity.location}</span>
                    </div>
                  )}
                  {opportunity.meetingGoals && opportunity.meetingGoals.length > 0 && (
                    <div className="flex items-center mt-1 text-muted-foreground">
                      <Target className="h-3 w-3 mr-1" />
                      <span>{opportunity.meetingGoals.filter(g => g.achieved).length}/{opportunity.meetingGoals.length} goals</span>
                    </div>
                  )}
                </div>
              ))}
              {contact.upcomingOpportunities.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{contact.upcomingOpportunities.length - 2} more opportunities
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

      {/* Networking Intelligence Section */}
      <div className="space-y-3 mb-4 border-t pt-4">
        {contact.referredBy && (
          <div className="flex items-start text-sm">
            <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">Referred by: </span>
              <span className="text-muted-foreground">{contact.referredBy}</span>
            </div>
          </div>
        )}

        {contact.linkedinConnections && contact.linkedinConnections.length > 0 && (
          <div className="flex items-start text-sm">
            <Users className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">LinkedIn connections: </span>
              <span className="text-muted-foreground">
                {contact.linkedinConnections.slice(0, 2).join(', ')}
                {contact.linkedinConnections.length > 2 && ` +${contact.linkedinConnections.length - 2} more`}
              </span>
            </div>
          </div>
        )}

        {contact.currentProjects && (
          <div className="flex items-start text-sm">
            <Briefcase className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">Current focus: </span>
              <span className="text-muted-foreground">{contact.currentProjects}</span>
            </div>
          </div>
        )}

        {contact.mutualBenefit && (
          <div className="flex items-start text-sm">
            <Target className="h-4 w-4 mr-2 mt-0.5 text-accent-foreground" />
            <div>
              <span className="font-medium text-foreground">Mutual benefit: </span>
              <span className="text-muted-foreground">{contact.mutualBenefit}</span>
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
      
      <OpportunityDetails
        opportunity={selectedOpportunity}
        isOpen={isOpportunityDialogOpen}
        onClose={() => setIsOpportunityDialogOpen(false)}
        onSave={handleOpportunitySave}
      />
    </Card>
  );
};

export default ContactCard;