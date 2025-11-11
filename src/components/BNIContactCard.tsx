import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useBNIContactMetrics } from '@/hooks/useBNIContactMetrics';
import { 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  Building2,
  Target,
  Gift,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BNIContactCardProps {
  contact: Contact;
  onScheduleMeeting: (contactId: string) => void;
  onGiveReferral: (contactId: string) => void;
  onViewDetails: (contact: Contact) => void;
  onConductGAINS: (contactId: string) => void;
}

export const BNIContactCard = ({ 
  contact, 
  onScheduleMeeting, 
  onGiveReferral, 
  onViewDetails,
  onConductGAINS 
}: BNIContactCardProps) => {
  const { metrics, loading } = useBNIContactMetrics(contact.id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRelationshipColor = (strength: number) => {
    if (strength >= 70) return 'text-green-600';
    if (strength >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-none mb-1">{contact.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {contact.position && <span>{contact.position}</span>}
                {contact.position && contact.company && <span>•</span>}
                {contact.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{contact.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {metrics?.gainsCompleted ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              GAINS Complete
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              GAINS Needed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Relationship Strength */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Relationship Strength</span>
            <span className={`text-sm font-bold ${getRelationshipColor(metrics?.relationshipStrength || 0)}`}>
              {metrics?.relationshipStrength || 0}%
            </span>
          </div>
          <Progress value={metrics?.relationshipStrength || 0} className="h-2" />
        </div>

        {/* BNI Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Given</div>
            <div className="flex items-center justify-center gap-1">
              <Gift className="h-3 w-3 text-green-600" />
              <span className="font-bold text-sm">{metrics?.referralsGiven || 0}</span>
            </div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Received</div>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="font-bold text-sm">{metrics?.referralsReceived || 0}</span>
            </div>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Meetings</div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3 w-3 text-purple-600" />
              <span className="font-bold text-sm">{metrics?.totalMeetings || 0}</span>
            </div>
          </div>
        </div>

        {/* Looking For / Offering */}
        {(contact.lookingFor || contact.offering) && (
          <div className="space-y-2 p-3 bg-accent/50 rounded-lg">
            {contact.lookingFor && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Looking For
                </div>
                <p className="text-sm">{contact.lookingFor}</p>
              </div>
            )}
            {contact.offering && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Offering
                </div>
                <p className="text-sm">{contact.offering}</p>
              </div>
            )}
          </div>
        )}

        {/* GAINS Insights */}
        {metrics?.gainsCompleted && (metrics.idealReferral || metrics.howToHelp) && (
          <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-xs font-semibold text-primary mb-2">GAINS Insights</div>
            {metrics.idealReferral && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Ideal Referral</div>
                <p className="text-sm">{metrics.idealReferral}</p>
              </div>
            )}
            {metrics.howToHelp && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">How to Help</div>
                <p className="text-sm">{metrics.howToHelp}</p>
              </div>
            )}
          </div>
        )}

        {/* Follow-up Actions */}
        {metrics?.followUpActions && metrics.followUpActions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">Action Items</div>
            {metrics.followUpActions.slice(0, 2).map((action, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Badge 
                  variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}
                  className="text-xs px-2 py-0"
                >
                  {action.priority}
                </Badge>
                <span className="text-muted-foreground">{action.action}</span>
              </div>
            ))}
          </div>
        )}

        {/* Last Contact */}
        {metrics && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last contact: {metrics.daysSinceLastContact} days ago</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onScheduleMeeting(contact.id)}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onGiveReferral(contact.id)}
            className="w-full"
          >
            <Gift className="h-4 w-4 mr-1" />
            Refer
          </Button>
        </div>

        {!metrics?.gainsCompleted && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onConductGAINS(contact.id)}
            className="w-full"
          >
            <Target className="h-4 w-4 mr-2" />
            Conduct GAINS Meeting
          </Button>
        )}

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(contact)}
          className="w-full"
        >
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );
};
