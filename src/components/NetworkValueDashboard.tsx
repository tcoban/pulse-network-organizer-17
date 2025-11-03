import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNetworkValue } from '@/hooks/useNetworkValue';
import { TrendingUp, Users, DollarSign, Heart } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export const NetworkValueDashboard = () => {
  const { allValues, loading } = useNetworkValue();
  const { contacts } = useContacts();

  if (loading) {
    return <div className="text-muted-foreground">Loading network value data...</div>;
  }

  const topContacts = allValues.slice(0, 10);
  const totalNetworkValue = allValues.reduce((sum, v) => sum + v.lifetimeValue, 0);
  const averageRelationshipStrength = allValues.length > 0
    ? Math.round(allValues.reduce((sum, v) => sum + v.relationshipStrength, 0) / allValues.length)
    : 0;

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Network Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalNetworkValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined business value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Relationship Strength</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRelationshipStrength}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Network health score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valued Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allValues.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contacts with calculated value
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 10 Most Valuable Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topContacts.map((value, index) => (
              <div key={value.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{getContactName(value.contactId)}</p>
                    <p className="text-xs text-muted-foreground">
                      Relationship Strength: {value.relationshipStrength}% | Reciprocity: {value.reciprocityScore.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF {value.lifetimeValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {value.totalReferralsGiven + value.totalReferralsReceived} referrals
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};