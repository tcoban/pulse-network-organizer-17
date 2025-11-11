import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Award, Medal, Target, Users, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamMemberStats {
  id: string;
  name: string;
  referralsGiven: number;
  referralsReceived: number;
  gainsMeetings: number;
  totalBusiness: number;
  activeContacts: number;
  weeklyActivities: number;
  score: number;
}

export function TeamLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<TeamMemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  async function loadLeaderboard() {
    try {
      setLoading(true);

      const startDate = getStartDate(timeframe);

      // Fetch team members
      const { data: teamMembers, error: tmError } = await supabase
        .from('team_members')
        .select('id, first_name, last_name, email')
        .eq('is_active', true);

      if (tmError) throw tmError;

      const stats = await Promise.all(
        (teamMembers || []).map(async (member) => {
          // Get referrals given
          const { count: refGiven } = await supabase
            .from('referrals_given')
            .select('*', { count: 'exact', head: true })
            .eq('given_by', member.id)
            .gte('created_at', startDate);

          // Get referrals received
          const { count: refReceived } = await supabase
            .from('referrals_received')
            .select('*', { count: 'exact', head: true })
            .eq('received_by', member.id)
            .gte('created_at', startDate);

          // Get GAINS meetings
          const { count: meetings } = await supabase
            .from('gains_meetings')
            .select('*', { count: 'exact', head: true })
            .eq('conducted_by', member.id)
            .gte('created_at', startDate);

          // Get total business value from closed referrals
          const { data: closedRefs } = await supabase
            .from('referrals_given')
            .select('closed_value')
            .eq('given_by', member.id)
            .eq('status', 'closed')
            .gte('created_at', startDate);

          const totalBusiness = closedRefs?.reduce((sum, r) => sum + (Number(r.closed_value) || 0), 0) || 0;

          // Get active contacts count
          const { count: contacts } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', member.id);

          // Get recent interactions count
          const { count: interactions } = await supabase
            .from('interactions')
            .select('*', { count: 'exact', head: true })
            .eq('contacted_by', member.id)
            .gte('created_at', startDate);

          // Calculate score (weighted formula)
          const score = 
            (refGiven || 0) * 10 + 
            (refReceived || 0) * 8 + 
            (meetings || 0) * 15 + 
            Math.floor((totalBusiness / 1000)) * 5 + 
            (interactions || 0) * 3;

          return {
            id: member.id,
            name: `${member.first_name} ${member.last_name}`,
            referralsGiven: refGiven || 0,
            referralsReceived: refReceived || 0,
            gainsMeetings: meetings || 0,
            totalBusiness,
            activeContacts: contacts || 0,
            weeklyActivities: interactions || 0,
            score
          };
        })
      );

      // Sort by score descending
      setLeaderboard(stats.sort((a, b) => b.score - a.score));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStartDate(tf: 'week' | 'month' | 'all'): string {
    const now = new Date();
    switch (tf) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'all':
        return new Date(0).toISOString();
    }
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Trophy className="h-6 w-6 text-warning" />;
    if (index === 1) return <Medal className="h-6 w-6 text-muted-foreground" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Team Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-warning" />
              Team Leaderboard
            </CardTitle>
            <CardDescription>Competition drives excellence</CardDescription>
          </div>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((member, index) => (
            <div
              key={member.id}
              className={`p-4 rounded-lg border transition-all ${
                index === 0
                  ? 'bg-warning/10 border-warning/30 shadow-lg'
                  : index === 1
                  ? 'bg-muted/50 border-muted-foreground/20'
                  : index === 2
                  ? 'bg-amber-500/10 border-amber-600/20'
                  : 'bg-background border-border hover:bg-accent/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {getRankIcon(index)}
                </div>

                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    {member.name}
                    {index === 0 && (
                      <Badge className="bg-warning text-warning-foreground">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Top Performer
                      </Badge>
                    )}
                  </h4>
                  
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {member.score} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {member.referralsGiven} given
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {member.gainsMeetings} GAINS
                    </span>
                    {member.totalBusiness > 0 && (
                      <span className="flex items-center gap-1 font-medium text-success">
                        💰 ${member.totalBusiness.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">
                    {member.score}
                  </div>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No activity yet. Be the first to compete!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
