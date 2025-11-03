import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GiversGainDashboard } from '@/components/GiversGainDashboard';
import { WeeklyCommitmentCard } from '@/components/WeeklyCommitmentCard';
import { NetworkValueDashboard } from '@/components/NetworkValueDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReferrals } from '@/hooks/useReferrals';
import { Calendar, TrendingUp, Target, Award } from 'lucide-react';

const BNI = () => {
  const { referralsGiven, referralsReceived } = useReferrals();

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
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule 1-2-1 Meeting
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Give a Referral
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Log Visibility Day
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="network-value">Network Value</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

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
    </div>
  );
};

export default BNI;