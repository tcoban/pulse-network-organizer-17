import { useState, useMemo } from 'react';
import { Contact, ContactOpportunity, MeetingGoal } from '@/types/contact';
import { teamMembers } from '@/data/mockContacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamOpportunitiesProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
}

interface OpportunityWithContact extends ContactOpportunity {
  contactName: string;
  contactId: string;
  assignedTo: string;
}

interface PastOpportunityReminder extends OpportunityWithContact {
  daysSinceOpportunity: number;
  needsGoalUpdate: boolean;
  unachievedGoals: MeetingGoal[];
}

const TeamOpportunities = ({ contacts, onUpdateContact }: TeamOpportunitiesProps) => {
  const { toast } = useToast();
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('all');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysFromNow = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get all opportunities with contact info
  const allOpportunities: OpportunityWithContact[] = useMemo(() => {
    return contacts.flatMap(contact => 
      (contact.upcomingOpportunities || []).map(opportunity => ({
        ...opportunity,
        contactName: contact.name,
        contactId: contact.id,
        assignedTo: contact.assignedTo
      }))
    );
  }, [contacts]);

  // Filter opportunities by team member
  const filteredOpportunities = useMemo(() => {
    if (selectedTeamMember === 'all') return allOpportunities;
    return allOpportunities.filter(opp => opp.assignedTo === selectedTeamMember);
  }, [allOpportunities, selectedTeamMember]);

  // Separate upcoming and past opportunities
  const { upcomingOpportunities, pastOpportunities } = useMemo(() => {
    const now = new Date();
    const upcoming = filteredOpportunities.filter(opp => opp.date > now);
    const past = filteredOpportunities.filter(opp => opp.date <= now);
    
    return {
      upcomingOpportunities: upcoming.sort((a, b) => a.date.getTime() - b.date.getTime()),
      pastOpportunities: past.sort((a, b) => b.date.getTime() - a.date.getTime())
    };
  }, [filteredOpportunities]);

  // Calculate past opportunities that need follow-up
  const pastOpportunityReminders: PastOpportunityReminder[] = useMemo(() => {
    const now = new Date();
    
    return pastOpportunities.map(opportunity => {
      const daysSinceOpportunity = Math.abs(getDaysFromNow(opportunity.date));
      const unachievedGoals = opportunity.meetingGoals?.filter(goal => !goal.achieved) || [];
      const needsGoalUpdate = daysSinceOpportunity >= 30 && unachievedGoals.length > 0;
      
      return {
        ...opportunity,
        daysSinceOpportunity,
        needsGoalUpdate,
        unachievedGoals
      };
    });
  }, [pastOpportunities]);

  const urgentReminders = pastOpportunityReminders.filter(reminder => reminder.needsGoalUpdate);

  const handleMarkGoalAchieved = (opportunityId: string, goalId: string, contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const updatedContact = {
      ...contact,
      upcomingOpportunities: contact.upcomingOpportunities?.map(opp =>
        opp.id === opportunityId
          ? {
              ...opp,
              meetingGoals: opp.meetingGoals?.map(goal =>
                goal.id === goalId ? { ...goal, achieved: true } : goal
              )
            }
          : opp
      )
    };

    onUpdateContact(updatedContact);
    
    toast({
      title: "Goal marked as achieved",
      description: "The meeting goal has been updated successfully."
    });
  };

  const handleMarkAllGoalsMissed = (opportunityId: string, contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const updatedContact = {
      ...contact,
      upcomingOpportunities: contact.upcomingOpportunities?.map(opp =>
        opp.id === opportunityId
          ? {
              ...opp,
              meetingGoals: opp.meetingGoals?.map(goal => ({ ...goal, achieved: false }))
            }
          : opp
      )
    };

    onUpdateContact(updatedContact);
    
    toast({
      title: "Goals marked as missed",
      description: "All unachieved goals have been marked as missed."
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'appointment': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'considering': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Opportunities</h2>
          <p className="text-muted-foreground">Track upcoming opportunities and follow up on past meetings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Urgent Reminders */}
      {urgentReminders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Bell className="h-5 w-5 mr-2" />
              Urgent: Goal Follow-ups Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentReminders.map(reminder => (
                <div key={`${reminder.contactId}-${reminder.id}`} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{reminder.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reminder.contactName} • {reminder.daysSinceOpportunity} days ago
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Follow-up Required
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-foreground">Unachieved Goals:</p>
                    {reminder.unachievedGoals.map(goal => (
                      <div key={goal.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>{goal.description}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkGoalAchieved(reminder.id, goal.id, reminder.contactId)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Achieved
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMarkAllGoalsMissed(reminder.id, reminder.contactId)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Mark All as Missed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming Opportunities ({upcomingOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Opportunities ({pastOpportunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingOpportunities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Upcoming Opportunities</h3>
                <p className="text-muted-foreground">
                  {selectedTeamMember === 'all' 
                    ? 'No upcoming opportunities scheduled for any team member.'
                    : `No upcoming opportunities for ${selectedTeamMember}.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingOpportunities.map(opportunity => (
                <Card key={`${opportunity.contactId}-${opportunity.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{opportunity.title}</h3>
                        <p className="text-muted-foreground">
                          Contact: {opportunity.contactName} • Assigned to: {opportunity.assignedTo}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(opportunity.type)}>{opportunity.type}</Badge>
                        <Badge className={getStatusColor(opportunity.registrationStatus || 'considering')}>
                          {opportunity.registrationStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(opportunity.date)}
                      </div>
                      {opportunity.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {opportunity.location}
                        </div>
                      )}
                    </div>

                    {opportunity.description && (
                      <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>
                    )}

                    {opportunity.meetingGoals && opportunity.meetingGoals.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center mb-3">
                          <Target className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium text-foreground">Meeting Goals</span>
                          <Badge variant="outline" className="ml-2">
                            {opportunity.meetingGoals.filter(g => g.achieved).length}/{opportunity.meetingGoals.length} achieved
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {opportunity.meetingGoals.map(goal => (
                            <div key={goal.id} className="flex items-center text-sm">
                              <div className={`w-2 h-2 rounded-full mr-2 ${goal.achieved ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className={goal.achieved ? 'line-through text-muted-foreground' : ''}>{goal.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastOpportunities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Past Opportunities</h3>
                <p className="text-muted-foreground">
                  {selectedTeamMember === 'all' 
                    ? 'No past opportunities found for any team member.'
                    : `No past opportunities for ${selectedTeamMember}.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastOpportunityReminders.map(reminder => (
                <Card key={`${reminder.contactId}-${reminder.id}`} className={reminder.needsGoalUpdate ? 'border-orange-200' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{reminder.title}</h3>
                        <p className="text-muted-foreground">
                          Contact: {reminder.contactName} • Assigned to: {reminder.assignedTo}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(reminder.type)}>{reminder.type}</Badge>
                        {reminder.needsGoalUpdate && (
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Follow-up Needed
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(reminder.date)} ({reminder.daysSinceOpportunity} days ago)
                      </div>
                      {reminder.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {reminder.location}
                        </div>
                      )}
                    </div>

                    {reminder.meetingGoals && reminder.meetingGoals.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center mb-3">
                          <Target className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium text-foreground">Meeting Goals</span>
                          <Badge variant="outline" className="ml-2">
                            {reminder.meetingGoals.filter(g => g.achieved).length}/{reminder.meetingGoals.length} achieved
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {reminder.meetingGoals.map(goal => (
                            <div key={goal.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${goal.achieved ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className={goal.achieved ? 'line-through text-muted-foreground' : ''}>{goal.description}</span>
                              </div>
                              {!goal.achieved && reminder.needsGoalUpdate && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkGoalAchieved(reminder.id, goal.id, reminder.contactId)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark Achieved
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamOpportunities;