import { RelationshipAnalyticsDashboard } from '@/components/RelationshipAnalyticsDashboard';
import { RelationshipDecayAlerts } from '@/components/RelationshipDecayAlerts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="decay">Decay Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RelationshipAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="decay">
          <RelationshipDecayAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
