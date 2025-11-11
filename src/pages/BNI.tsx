import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GiversGainDashboard } from '@/components/GiversGainDashboard';
import { WeeklyCommitmentCard } from '@/components/WeeklyCommitmentCard';
import { NetworkValueDashboard } from '@/components/NetworkValueDashboard';
import { BNIDashboard } from '@/components/BNIDashboard';
import { BNIContactCard } from '@/components/BNIContactCard';
import { BNIFollowUpTracker } from '@/components/BNIFollowUpTracker';
import { GAINSMeetingForm } from '@/components/GAINSMeetingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReferrals } from '@/hooks/useReferrals';
import { useContacts } from '@/hooks/useContacts';
import { useWeeklyCommitments } from '@/hooks/useWeeklyCommitments';
import { ReferralTrackerDialog } from '@/components/ReferralTrackerDialog';
import { IntroductionMatcher } from '@/components/IntroductionMatcher';
import OpportunityFormEnhanced from '@/components/OpportunityFormEnhanced';
import { Contact } from '@/types/contact';
import { Calendar, TrendingUp, Target, Award, Users, BarChart3, HelpCircle, UserCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBNIIntegration } from '@/hooks/useBNIIntegration';
import { SystemTutorial } from '@/components/SystemTutorial';

const BNI = () => {
  const { referralsGiven, referralsReceived } = useReferrals();
  const { contacts } = useContacts();
  const { incrementProgress } = useWeeklyCommitments();
  const { toast } = useToast();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Initialize BNI integration (creates "Connect People" project automatically)
  useBNIIntegration();
  
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showGAINSForm, setShowGAINSForm] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // Check if user has seen tutorial
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('bni_tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  const handleScheduleMeeting = () => {
    // For now, show a dialog without pre-selecting a contact
    // User can select contact from within the dialog
    toast({
      title: 'Coming Soon',
      description: 'Meeting scheduling will open the opportunity form. For now, schedule from contacts page.',
    });
  };

  const handleGiveReferral = () => {
    setShowReferralDialog(true);
  };

  const handleLogVisibility = async () => {
    const success = await incrementProgress('visibility');
    if (success) {
      toast({
        title: 'Visibility Day Logged',
        description: 'Your weekly commitment has been updated.',
      });
    }
  };

  const handleScheduleMeetingForContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowMeetingDialog(true);
  };

  const handleGiveReferralForContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowReferralDialog(true);
  };

  const handleConductGAINS = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setShowGAINSForm(true);
    }
  };

  const handleViewContactDetails = (contact: Contact) => {
    // Navigate to contacts page with this contact selected
    window.location.href = `/contacts?contactId=${contact.id}`;
  };

  // Filter contacts for BNI view
  const filteredBNIContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.lookingFor?.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.offering?.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  return (
    <>
      {showTutorial && <SystemTutorial onComplete={() => setShowTutorial(false)} />}
      
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <Award className="h-8 w-8 text-primary" />
              BNI Networking System
            </h1>
            <p className="text-muted-foreground">
              Systematic relationship building following Giver's Gain philosophy
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowTutorial(true)}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Show Tutorial
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <WeeklyCommitmentCard />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleScheduleMeeting}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule 1-2-1 Meeting
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleGiveReferral}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Give a Referral
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleLogVisibility}
              >
                <Target className="h-4 w-4 mr-2" />
                Log Visibility Day
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <UserCircle className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="network-value">Network</TabsTrigger>
            <TabsTrigger value="introductions">Match</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BNIDashboard />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    BNI Network Contacts
                  </CardTitle>
                  <Badge variant="secondary">{filteredBNIContacts.length} contacts</Badge>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts by name, company, looking for, or offering..."
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBNIContacts.map(contact => (
                    <BNIContactCard
                      key={contact.id}
                      contact={contact}
                      onScheduleMeeting={handleScheduleMeetingForContact}
                      onGiveReferral={handleGiveReferralForContact}
                      onViewDetails={handleViewContactDetails}
                      onConductGAINS={handleConductGAINS}
                    />
                  ))}
                </div>
                {filteredBNIContacts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No contacts found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followups" className="space-y-6">
            <BNIFollowUpTracker />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <GiversGainDashboard />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals Given</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralsGiven.slice(0, 5).map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{ref.referredToName || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.serviceDescription.substring(0, 50)}...
                          </p>
                        </div>
                        <Badge variant={
                          ref.status === 'completed' ? 'default' :
                          ref.status === 'accepted' ? 'secondary' :
                          ref.status === 'declined' ? 'destructive' : 'outline'
                        }>
                          {ref.status}
                        </Badge>
                      </div>
                    ))}
                    {referralsGiven.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No referrals given yet. Start building your network value!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals Received</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralsReceived.slice(0, 5).map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{ref.clientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {ref.serviceDescription.substring(0, 50)}...
                          </p>
                        </div>
                        <Badge variant={
                          ref.status === 'completed' ? 'default' :
                          ref.status === 'in_progress' ? 'secondary' :
                          ref.status === 'lost' ? 'destructive' : 'outline'
                        }>
                          {ref.status}
                        </Badge>
                      </div>
                    ))}
                    {referralsReceived.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No referrals received yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="network-value" className="space-y-6">
            <NetworkValueDashboard />
          </TabsContent>

          <TabsContent value="introductions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Strategic Introductions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Find the best introduction opportunities based on your network's needs
                </p>
              </CardHeader>
              <CardContent>
                <IntroductionMatcher contacts={contacts} />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Dialogs */}
        <ReferralTrackerDialog 
          open={showReferralDialog}
          onOpenChange={setShowReferralDialog}
        />

        {showMeetingDialog && selectedContactId && (
          <OpportunityFormEnhanced
            contactId={selectedContactId}
            isOpen={showMeetingDialog}
            onClose={() => {
              setShowMeetingDialog(false);
              setSelectedContactId(null);
            }}
          />
        )}

        {selectedContact && (
          <GAINSMeetingForm
            open={showGAINSForm}
            onOpenChange={setShowGAINSForm}
            contactId={selectedContact.id}
            contactName={selectedContact.name}
          />
        )}
      </div>
    </>
  );
};

export default BNI;
