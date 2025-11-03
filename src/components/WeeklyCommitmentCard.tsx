import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWeeklyCommitments } from '@/hooks/useWeeklyCommitments';
import { Calendar, Gift, Eye, Phone, Flame } from 'lucide-react';

export const WeeklyCommitmentCard = () => {
  const { currentWeek, loading, incrementProgress, getCompletionPercentage } = useWeeklyCommitments();

  if (loading || !currentWeek) {
    return <div className="text-muted-foreground">Loading weekly commitment...</div>;
  }

  const completionPercentage = getCompletionPercentage();

  const commitments = [
    {
      icon: Calendar,
      label: '1-2-1 Meetings',
      completed: currentWeek.completedOneToOnes,
      target: currentWeek.targetOneToOnes,
      type: 'oneToOnes' as const
    },
    {
      icon: Gift,
      label: 'Referrals Given',
      completed: currentWeek.completedReferralsGiven,
      target: currentWeek.targetReferralsGiven,
      type: 'referrals' as const
    },
    {
      icon: Eye,
      label: 'Visibility Days',
      completed: currentWeek.completedVisibilityDays,
      target: currentWeek.targetVisibilityDays,
      type: 'visibility' as const
    },
    {
      icon: Phone,
      label: 'Follow-ups',
      completed: currentWeek.completedFollowUps,
      target: currentWeek.targetFollowUps,
      type: 'followUps' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Commitment</CardTitle>
          {currentWeek.streakWeeks > 0 && (
            <Badge variant="default" className="gap-1">
              <Flame className="h-3 w-3" />
              {currentWeek.streakWeeks} Week Streak
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} />
        </div>

        <div className="space-y-4">
          {commitments.map(({ icon: Icon, label, completed, target, type }) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {completed} / {target}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => incrementProgress(type)}
                disabled={completed >= target}
              >
                +1
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};