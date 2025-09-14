import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ClickableStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const ClickableStatsCard = ({ title, value, icon: Icon, description, trend, onClick }: ClickableStatsCardProps) => {
  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <span className={`text-xs ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {onClick && (
          <div className="mt-3 text-xs text-muted-foreground">
            Click to drill down
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClickableStatsCard;