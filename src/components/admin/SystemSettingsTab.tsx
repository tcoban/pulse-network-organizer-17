import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export function SystemSettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          System-wide configuration and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          System settings configuration will be available here. This includes AI thresholds,
          notification preferences, data retention policies, and more.
        </p>
      </CardContent>
    </Card>
  );
}
