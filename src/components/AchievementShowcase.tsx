import { Trophy, Star, Target, Zap, Award, Crown, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  points: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AchievementShowcaseProps {
  achievements: Achievement[];
  totalPoints: number;
}

export function AchievementShowcase({ achievements, totalPoints }: AchievementShowcaseProps) {
  const getAchievementIcon = (achievementId: string) => {
    if (achievementId.includes('referral')) return Target;
    if (achievementId.includes('gains')) return Star;
    if (achievementId.includes('network')) return Award;
    return Trophy;
  };

  const getTierColor = (tier?: Achievement['tier']) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-purple-700';
      case 'gold': return 'from-yellow-500 to-yellow-700';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'bronze': return 'from-orange-600 to-orange-800';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  const getTierIcon = (tier?: Achievement['tier']) => {
    switch (tier) {
      case 'platinum': return Crown;
      case 'gold': return Trophy;
      case 'silver': return Medal;
      case 'bronze': return Award;
      default: return Star;
    }
  };

  return (
    <div className="space-y-6">
      {/* Total Points Display */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total XP Earned</p>
            <p className="text-4xl font-bold text-primary mt-1">{totalPoints}</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Card>

      {/* Achievement Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {achievements.map(achievement => {
          const Icon = getAchievementIcon(achievement.id);
          const TierIcon = getTierIcon(achievement.tier);
          const tierColor = getTierColor(achievement.tier);

          return (
            <Card
              key={achievement.id}
              className={cn(
                'p-5 transition-all duration-300',
                achievement.unlocked 
                  ? 'bg-gradient-to-br border-2 shadow-lg' 
                  : 'opacity-60 hover:opacity-80',
                achievement.unlocked && tierColor
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
                  achievement.unlocked 
                    ? 'bg-background/90' 
                    : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'h-6 w-6',
                    achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className={cn(
                        'font-semibold',
                        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.tier && achievement.unlocked && (
                      <TierIcon className="h-5 w-5 text-yellow-500 shrink-0" />
                    )}
                  </div>
                  
                  {achievement.unlocked ? (
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                      Unlocked • {achievement.points} XP
                    </Badge>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(achievement.progress)}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Earn {achievement.points} XP when unlocked
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Next Achievement Hint */}
      {achievements.some(a => !a.unlocked) && (
        <Card className="p-4 bg-accent/50 border-dashed">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Pro tip:</span> Complete your daily tasks to unlock more achievements and climb the leaderboard!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
