import { Contact } from '@/types/contact';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  MoreHorizontal,
  Linkedin,
  MessageSquare,
  UserCheck,
  Users,
  Target,
  Star,
  Briefcase,
  Shield,
  Clock,
  User,
  Gift,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
}

const ContactCard = ({ contact, onEdit, onDelete, onViewDetails }: ContactCardProps) => {
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
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

         <div className="space-y-2 mb-4">
          {contact.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <span>{contact.email}</span>
            </div>
          )}
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
          {contact.affiliation && (
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2 text-accent-foreground" />
              <Badge variant="outline" className="text-xs font-medium">
                {contact.affiliation}
              </Badge>
            </div>
          )}
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
                    <span className="ml-1 text-muted-foreground">{lastInteraction.contactedBy || 'Unknown'}</span>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <span className="font-medium text-foreground mr-2">Cooperation level:</span>
              {renderCooperationRating(contact.cooperationRating)}
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium text-foreground mr-2">Potential score:</span>
              {renderCooperationRating(contact.potentialScore)}
            </div>
          </div>
        </div>

        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {contact.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

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
    </Card>
  );
};

export default ContactCard;