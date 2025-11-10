import { Ghost, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGhostMode } from '@/hooks/useGhostMode';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const GhostModeToggle = () => {
  const {
    isGhostModeActive,
    ghostUserId,
    availableMembers,
    enableGhostMode,
    disableGhostMode,
    canUseGhostMode,
  } = useGhostMode();

  if (!canUseGhostMode) return null;

  const activeGhostMember = availableMembers.find(m => m.id === ghostUserId);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {isGhostModeActive && (
        <Alert className="bg-primary/10 border-primary">
          <Ghost className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background">
                Ghost Mode Active
              </Badge>
              <span className="text-sm">
                Viewing as: {activeGhostMember?.first_name} {activeGhostMember?.last_name}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={disableGhostMode}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-card border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Ghost className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Ghost Mode</span>
          <Badge variant="secondary" className="text-xs">Admin</Badge>
        </div>
        
        <Select
          value={ghostUserId || 'disabled'}
          onValueChange={(value) => {
            if (value === 'disabled') {
              disableGhostMode();
            } else {
              enableGhostMode(value);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disabled">
              <span className="flex items-center gap-2">
                <X className="h-3 w-3" />
                Disabled (Your View)
              </span>
            </SelectItem>
            {availableMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.first_name} {member.last_name} - {member.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground mt-2">
          View the system as any team member to see their perspective
        </p>
      </div>
    </div>
  );
};
