import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  connectPeopleProgress: number;
  totalReferralsGiven: number;
  totalReferralsReceived: number;
  totalBusinessGenerated: number;
  totalBusinessReceived: number;
  networkROI: number;
  giverGainRatio: number;
}

interface PipelineStage {
  name: string;
  count: number;
  value: number;
}

interface TopIntroducer {
  name: string;
  referralsGiven: number;
  businessGenerated: number;
  email: string;
}

export function BNIDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    connectPeopleProgress: 0,
    totalReferralsGiven: 0,
    totalReferralsReceived: 0,
    totalBusinessGenerated: 0,
    totalBusinessReceived: 0,
    networkROI: 0,
    giverGainRatio: 0,
  });
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [topIntroducers, setTopIntroducers] = useState<TopIntroducer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Connect People project
      const { data: project } = await supabase
        .from('projects')
        .select('current_value, target_value')
        .eq('title', 'Connect People')
        .maybeSingle();

      // Fetch referrals given by current user
      const { data: referralsGiven } = await supabase
        .from('referrals_given')
        .select('*, contact:contacts(name)')
        .eq('given_by', user?.id);

      // Fetch referrals received by current user
      const { data: referralsReceived } = await supabase
        .from('referrals_received')
        .select('*')
        .eq('received_by', user?.id);

      // Calculate stats
      const totalGenerated = referralsGiven?.reduce((sum, r) => sum + (Number(r.closed_value) || 0), 0) || 0;
      const totalReceived = referralsReceived?.reduce((sum, r) => sum + (Number(r.closed_value) || 0), 0) || 0;
      const roi = totalReceived > 0 ? ((totalGenerated - totalReceived) / totalReceived) * 100 : 0;
      const ratio = referralsReceived && referralsReceived.length > 0 
        ? (referralsGiven?.length || 0) / referralsReceived.length 
        : referralsGiven?.length || 0;

      setStats({
        connectPeopleProgress: project ? Math.round((Number(project.current_value) / Number(project.target_value || 1)) * 100) : 0,
        totalReferralsGiven: referralsGiven?.length || 0,
        totalReferralsReceived: referralsReceived?.length || 0,
        totalBusinessGenerated: totalGenerated,
        totalBusinessReceived: totalReceived,
        networkROI: roi,
        giverGainRatio: ratio,
      });

      // Pipeline stages
      const pipeline: PipelineStage[] = [
        {
          name: 'Pending',
          count: referralsGiven?.filter(r => r.status === 'pending').length || 0,
          value: referralsGiven?.filter(r => r.status === 'pending').reduce((sum, r) => sum + Number(r.estimated_value || 0), 0) || 0,
        },
        {
          name: 'In Progress',
          count: referralsGiven?.filter(r => r.status === 'in_progress').length || 0,
          value: referralsGiven?.filter(r => r.status === 'in_progress').reduce((sum, r) => sum + Number(r.estimated_value || 0), 0) || 0,
        },
        {
          name: 'Closed',
          count: referralsGiven?.filter(r => r.status === 'closed').length || 0,
          value: referralsGiven?.filter(r => r.status === 'closed').reduce((sum, r) => sum + Number(r.closed_value || 0), 0) || 0,
        },
        {
          name: 'Lost',
          count: referralsGiven?.filter(r => r.status === 'lost').length || 0,
          value: 0,
        },
      ];
      setPipelineData(pipeline);

      // Fetch top introducers (users who have given the most referrals)
      const { data: allReferrals } = await supabase
        .from('referrals_given')
        .select('given_by, closed_value, contact:contacts(assigned_to, profiles:assigned_to(first_name, last_name, email))');

      if (allReferrals) {
        const introducerMap = new Map<string, TopIntroducer>();
        
        allReferrals.forEach((ref: any) => {
          const profile = ref.contact?.profiles;
          if (profile) {
            const key = profile.email || 'Unknown';
            const existing = introducerMap.get(key) || {
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
              referralsGiven: 0,
              businessGenerated: 0,
              email: profile.email || '',
            };
            
            existing.referralsGiven += 1;
            existing.businessGenerated += Number(ref.closed_value || 0);
            introducerMap.set(key, existing);
          }
        });

        const sorted = Array.from(introducerMap.values())
          .sort((a, b) => b.businessGenerated - a.businessGenerated)
          .slice(0, 5);
        
        setTopIntroducers(sorted);
      }

    } catch (error) {
      console.error('Error fetching BNI dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#ef4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Giver's Gain Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.giverGainRatio === Infinity ? '∞' : stats.giverGainRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReferralsGiven} given / {stats.totalReferralsReceived} received
            </p>
            <Badge variant={stats.giverGainRatio >= 1 ? 'default' : 'destructive'} className="mt-2">
              {stats.giverGainRatio >= 1 ? 'Healthy' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Network ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.networkROI.toFixed(0)}%
              {stats.networkROI >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Generated: CHF {stats.totalBusinessGenerated.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Received: CHF {stats.totalBusinessReceived.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connect People</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connectPeopleProgress}%</div>
            <Progress value={stats.connectPeopleProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Project progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Business</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {(stats.totalBusinessGenerated + stats.totalBusinessReceived).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined network value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Referral Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Pipeline</CardTitle>
            <CardDescription>Status breakdown of referrals given</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Count: {payload[0].payload.count}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Value: CHF {payload[0].value?.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" name="Pipeline Value (CHF)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Referral Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Distribution</CardTitle>
            <CardDescription>Breakdown by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Introducers Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Top Introducers Leaderboard
          </CardTitle>
          <CardDescription>
            Network members generating the most business value
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topIntroducers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No introduction data available yet
            </p>
          ) : (
            <div className="space-y-4">
              {topIntroducers.map((introducer, index) => (
                <div key={introducer.email} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{introducer.name}</div>
                    <div className="text-sm text-muted-foreground">{introducer.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      CHF {introducer.businessGenerated.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {introducer.referralsGiven} referral{introducer.referralsGiven !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge variant="default" className="gap-1">
                      <Award className="h-3 w-3" />
                      Top
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
