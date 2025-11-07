import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GiversGainDashboard } from '@/components/GiversGainDashboard';
import { WeeklyCommitmentCard } from '@/components/WeeklyCommitmentCard';
import { NetworkValueDashboard } from '@/components/NetworkValueDashboard';
import { BNIDashboard } from '@/components/BNIDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReferrals } from '@/hooks/useReferrals';
import { useContacts } from '@/hooks/useContacts';
import { useWeeklyCommitments } from '@/hooks/useWeeklyCommitments';
import { ReferralTrackerDialog } from '@/components/ReferralTrackerDialog';
import { IntroductionMatcher } from '@/components/IntroductionMatcher';
import OpportunityFormEnhanced from '@/components/OpportunityFormEnhanced';
import { Calendar, TrendingUp, Target, Award, Users, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BNI = () => {
  const { referralsGiven, referralsReceived } = useReferrals();
  const { contacts } = useContacts();
  const { incrementProgress } = useWeeklyCommitments();
  const { toast } = useToast();
  
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Initialize BNI integration on mount
  useEffect(() => {
    const initBNI = async () => {
      try {
        // BNI integration will initialize automatically when needed
        console.log('BNI system ready');
      } catch (error) {
        console.error('Error initializing BNI:', error);
      }
    };
    initBNI();
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Award className="h-8 w-8 text-primary" />
          BNI Networking System
        </h1>
        <p className="text-muted-foreground">
          Systematic relationship building following Giver's Gain philosophy
        </p>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="network-value">Network Value</TabsTrigger>
          <TabsTrigger value="introductions">Introductions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <BNIDashboard />
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

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon: Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Predictive analytics, trend analysis, and strategic insights will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ReferralTrackerDialog 
        open={showReferralDialog}
        onOpenChange={setShowReferralDialog}
      />
    </div>
  );
};

export default BNI;