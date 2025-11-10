import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Goal } from '@/hooks/useGoals';
import { format, subDays, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, startOfDay } from 'date-fns';

interface ProgressTrendsChartProps {
  goals: Goal[];
}

type TimePeriod = 'weekly' | 'monthly';

export function ProgressTrendsChart({ goals }: ProgressTrendsChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

  const chartData = useMemo(() => {
    const now = new Date();
    const periods = timePeriod === 'weekly' ? 8 : 12; // 8 weeks or 12 months
    
    if (timePeriod === 'weekly') {
      // Generate last 8 weeks of data
      const weeks = Array.from({ length: periods }, (_, i) => {
        const weekStart = startOfWeek(subWeeks(now, periods - 1 - i));
        const weekEnd = endOfWeek(weekStart);
        
        // Calculate goals that existed during this week
        const goalsInWeek = goals.filter(g => {
          const goalCreated = new Date(g.created_at);
          return goalCreated <= weekEnd;
        });

        const activeGoals = goalsInWeek.filter(g => g.status === 'active').length;
        const completedGoals = goalsInWeek.filter(g => g.status === 'completed').length;
        const avgProgress = goalsInWeek.length > 0
          ? Math.round(goalsInWeek.reduce((sum, g) => sum + g.progress_percentage, 0) / goalsInWeek.length)
          : 0;

        return {
          period: format(weekStart, 'MMM dd'),
          activeGoals,
          completedGoals,
          avgProgress,
          totalGoals: goalsInWeek.length
        };
      });

      return weeks;
    } else {
      // Generate last 12 weeks as "months" (simplified for demo)
      const weeks = Array.from({ length: periods }, (_, i) => {
        const weekStart = startOfWeek(subWeeks(now, periods - 1 - i));
        const weekEnd = endOfWeek(weekStart);
        
        const goalsInWeek = goals.filter(g => {
          const goalCreated = new Date(g.created_at);
          return goalCreated <= weekEnd;
        });

        const activeGoals = goalsInWeek.filter(g => g.status === 'active').length;
        const completedGoals = goalsInWeek.filter(g => g.status === 'completed').length;
        const avgProgress = goalsInWeek.length > 0
          ? Math.round(goalsInWeek.reduce((sum, g) => sum + g.progress_percentage, 0) / goalsInWeek.length)
          : 0;

        return {
          period: format(weekStart, 'MMM'),
          activeGoals,
          completedGoals,
          avgProgress,
          totalGoals: goalsInWeek.length
        };
      });

      return weeks;
    }
  }, [goals, timePeriod]);

  const trends = useMemo(() => {
    if (chartData.length < 2) return { progress: 0, active: 0, completed: 0 };

    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];

    return {
      progress: current.avgProgress - previous.avgProgress,
      active: current.activeGoals - previous.activeGoals,
      completed: current.completedGoals - previous.completedGoals,
      total: current.totalGoals - previous.totalGoals
    };
  }, [chartData]);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Trends
            </CardTitle>
            <CardDescription>Track your goals progress over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timePeriod === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('weekly')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Weekly
            </Button>
            <Button
              variant={timePeriod === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod('monthly')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Avg Progress</div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getTrendColor(trends.progress)}`}>
                {chartData[chartData.length - 1]?.avgProgress || 0}%
              </span>
              {getTrendIcon(trends.progress)}
            </div>
            <div className={`text-xs ${getTrendColor(trends.progress)}`}>
              {trends.progress > 0 ? '+' : ''}{trends.progress}% vs last period
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Active Goals</div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getTrendColor(trends.active)}`}>
                {chartData[chartData.length - 1]?.activeGoals || 0}
              </span>
              {getTrendIcon(trends.active)}
            </div>
            <div className={`text-xs ${getTrendColor(trends.active)}`}>
              {trends.active > 0 ? '+' : ''}{trends.active} vs last period
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getTrendColor(trends.completed)}`}>
                {chartData[chartData.length - 1]?.completedGoals || 0}
              </span>
              {getTrendIcon(trends.completed)}
            </div>
            <div className={`text-xs ${getTrendColor(trends.completed)}`}>
              {trends.completed > 0 ? '+' : ''}{trends.completed} vs last period
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Goals</div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getTrendColor(trends.total)}`}>
                {chartData[chartData.length - 1]?.totalGoals || 0}
              </span>
              {getTrendIcon(trends.total)}
            </div>
            <div className={`text-xs ${getTrendColor(trends.total)}`}>
              {trends.total > 0 ? '+' : ''}{trends.total} vs last period
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="avgProgress"
                name="Avg Progress %"
                stroke="hsl(var(--primary))"
                fill="url(#progressGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Count Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="activeGoals"
                name="Active Goals"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="completedGoals"
                name="Completed"
                stroke="hsl(142.1 76.2% 36.3%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142.1 76.2% 36.3%)' }}
              />
              <Line
                type="monotone"
                dataKey="totalGoals"
                name="Total Goals"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--muted-foreground))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
