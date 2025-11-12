import { useRelationshipDecay } from '@/hooks/useRelationshipDecay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

export const RelationshipDecayAlerts = () => {
  const navigate = useNavigate();
  const { decayingContacts, criticalCount, warningCount, loading, refresh } = useRelationshipDecay();

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const topDecaying = decayingContacts.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Relationship Decay Alerts
          </h3>
          <p className="text-sm text-muted-foreground">
            Contacts losing strength due to lack of interaction
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {criticalCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalCount}</strong> critical relationship{criticalCount > 1 ? 's' : ''} at risk of going cold (90+ days without contact)
          </AlertDescription>
        </Alert>
      )}

      {warningCount > 0 && criticalCount === 0 && (
        <Alert className="border-orange-500/20 bg-orange-500/10">
          <Clock className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700 dark:text-orange-400">
            <strong>{warningCount}</strong> relationship{warningCount > 1 ? 's' : ''} showing signs of decay (60+ days without contact)
          </AlertDescription>
        </Alert>
      )}

      {decayingContacts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              All relationships are healthy! Keep up the great work.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {topDecaying.map((contact) => (
          <Card key={contact.contactId} className={
            contact.decayLevel === 'critical' 
              ? 'border-destructive/50 bg-destructive/5' 
              : contact.decayLevel === 'warning'
              ? 'border-orange-500/50 bg-orange-500/5'
              : ''
          }>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{contact.contactName}</CardTitle>
                <Badge
                  variant={contact.decayLevel === 'critical' ? 'destructive' : 'outline'}
                  className={
                    contact.decayLevel === 'critical'
                      ? ''
                      : contact.decayLevel === 'warning'
                      ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      : 'bg-muted'
                  }
                >
                  {contact.decayLevel === 'critical' && '🚨 Critical'}
                  {contact.decayLevel === 'warning' && '⚠️ Warning'}
                  {contact.decayLevel === 'normal' && '⏰ Decaying'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Relationship Strength</span>
                  <span className="font-semibold">
                    {Math.round(contact.currentStrength)}/{contact.originalStrength}
                  </span>
                </div>
                <Progress 
                  value={(contact.currentStrength / contact.originalStrength) * 100} 
                  className={
                    contact.decayLevel === 'critical'
                      ? '[&>div]:bg-destructive'
                      : contact.decayLevel === 'warning'
                      ? '[&>div]:bg-orange-500'
                      : ''
                  }
                />
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last contact:</span>
                  <span className="font-semibold">{contact.daysSinceLastInteraction} days ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Decay rate:</span>
                  <span className="font-semibold">-{contact.decayRate}/day</span>
                </div>
              </div>

              {contact.estimatedDaysToZero > 0 && (
                <p className="text-xs text-muted-foreground">
                  Estimated {contact.estimatedDaysToZero} days until relationship goes cold
                </p>
              )}

              <Button
                onClick={() => navigate('/contacts')}
                variant={contact.decayLevel === 'critical' ? 'destructive' : 'outline'}
                size="sm"
                className="w-full"
              >
                Reconnect Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
