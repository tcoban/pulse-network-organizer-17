import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReferrals } from '@/hooks/useReferrals';
import { TrendingUp, TrendingDown, Gift, DollarSign } from 'lucide-react';

export const GiversGainDashboard = () => {
  const { 
    referralsGiven, 
    referralsReceived, 
    loading,
    calculateGiversGainRatio,
    getTotalBusinessGenerated,
    getTotalBusinessReceived
  } = useReferrals();

  if (loading) {
    return <div className="text-muted-foreground">Loading referral data...</div>;
  }

  const ratio = calculateGiversGainRatio();
  const totalGenerated = getTotalBusinessGenerated();
  const totalReceived = getTotalBusinessReceived();
  const isHealthyRatio = ratio >= 1;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Referrals Given</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referralsGiven.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total referrals provided
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Referrals Received</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referralsReceived.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Referrals from network
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Giver's Gain Ratio</CardTitle>
          {isHealthyRatio ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              {ratio === Infinity ? '∞' : ratio.toFixed(2)}
            </div>
            <Badge variant={isHealthyRatio ? 'default' : 'destructive'}>
              {isHealthyRatio ? 'Healthy' : 'Low'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Give:Receive ratio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Business Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            CHF {(totalGenerated + totalReceived).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Generated: CHF {totalGenerated.toLocaleString()} | Received: CHF {totalReceived.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};