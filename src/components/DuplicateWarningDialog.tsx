import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { getTypeColor } from "@/utils/opportunityHelpers";

interface Duplicate {
  id: string;
  title: string;
  date: string;
  source: string;
  matchScore: number;
  type?: string;
}

interface DuplicateWarningDialogProps {
  open: boolean;
  duplicates: Duplicate[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const DuplicateWarningDialog = ({ open, duplicates, onConfirm, onCancel }: DuplicateWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Potential Duplicate Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            Similar opportunities already exist. Are you sure you want to create this new opportunity?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-4">
          {duplicates.slice(0, 3).map((dup) => (
            <div key={dup.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{dup.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(dup.date), 'PPp')}
                  </div>
                </div>
                {dup.type && (
                  <Badge className={getTypeColor(dup.type as any)} variant="outline">
                    {dup.type}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  Source: {dup.source === 'm365_sync' ? 'Outlook Calendar' : 'Manual Entry'}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-warning">
                  {Math.round(dup.matchScore * 100)}% match
                </span>
              </div>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Create Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
