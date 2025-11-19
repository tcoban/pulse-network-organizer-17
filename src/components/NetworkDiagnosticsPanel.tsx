import { ConnectionDiagnostics } from '@/hooks/useNetworkGraph';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, UserX, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NetworkDiagnosticsPanelProps {
  diagnostics: ConnectionDiagnostics;
}

export function NetworkDiagnosticsPanel({ diagnostics }: NetworkDiagnosticsPanelProps) {
  const hasUnmatchedConnections = diagnostics.unmatchedConnections.length > 0;
  const hasIsolatedContacts = diagnostics.isolatedContacts.length > 0;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Network Health Overview
          </CardTitle>
          <CardDescription>
            Connection matching statistics and network diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total References</p>
              <p className="text-2xl font-bold">{diagnostics.totalConnectionReferences}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Matched</p>
              <p className="text-2xl font-bold text-green-600">{diagnostics.matchedConnections}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Unmatched</p>
              <p className="text-2xl font-bold text-amber-600">
                {diagnostics.unmatchedConnections.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Match Rate</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {diagnostics.matchRate}%
                {diagnostics.matchRate >= 80 && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {diagnostics.matchRate < 80 && (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
              </p>
            </div>
          </div>

          {diagnostics.matchRate < 80 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Network Coverage Could Be Better</AlertTitle>
              <AlertDescription>
                {diagnostics.matchRate < 50
                  ? 'Less than half of connection references are matched. Consider adding more contacts to improve network visibility.'
                  : 'Some connection references could not be matched. Add missing contacts to see the full network.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Unmatched Connections */}
      {hasUnmatchedConnections && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Unmatched Connections ({diagnostics.unmatchedConnections.length})
            </CardTitle>
            <CardDescription>
              These connection names don't match any contacts in your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {diagnostics.unmatchedConnections.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium">{name}</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      Not in Database
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Isolated Contacts */}
      {hasIsolatedContacts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Isolated Contacts ({diagnostics.isolatedContacts.length})
            </CardTitle>
            <CardDescription>
              Contacts with no visible connections in the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {diagnostics.isolatedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{contact.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {contact.company && <span>{contact.company}</span>}
                        {contact.company && contact.position && <Separator orientation="vertical" className="h-4" />}
                        {contact.position && <span>{contact.position}</span>}
                      </div>
                    </div>
                    <Badge variant="secondary">No Connections</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Perfect Network Message */}
      {!hasUnmatchedConnections && !hasIsolatedContacts && (
        <Card className="border-green-600/20 bg-green-50/10">
          <CardContent className="flex items-center gap-3 p-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-600">Excellent Network Health!</h3>
              <p className="text-sm text-muted-foreground">
                All connection references are matched and all contacts are connected in your network.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
