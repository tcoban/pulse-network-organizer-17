import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function AddGoalDialog({ open, onOpenChange, onGoalAdded }: any) {
  const { createGoal } = useGoals();
  const { projects } = useProjects();
  const { teamMembers } = useTeamMembers();
  const [targets, setTargets] = useState<any[]>([]);
  const [project, setProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("meeting");
  const [targetDate, setTargetDate] = useState<Date>();
  const [target, setTarget] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      supabase.from('targets').select('*').eq('project_id', project).then(({ data }) => setTargets(data || []));
    } else {
      setTargets([]);
    }
    setTarget("");
  }, [project]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createGoal(
        { title, description, category, target_date: targetDate?.toISOString().split('T')[0], status: "active", progress_percentage: 0, target_id: target || null },
        selectedTeamMembers
      );
      setTitle(""); setDescription(""); setCategory("meeting"); setTargetDate(undefined); setProject(""); setTarget(""); setSelectedTeamMembers([]);
      onGoalAdded(); onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = (memberId: string) => {
    if (!selectedTeamMembers.includes(memberId)) {
      setSelectedTeamMembers([...selectedTeamMembers, memberId]);
    }
  };

  const removeMember = (memberId: string) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== memberId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="meeting">Meeting</SelectItem><SelectItem value="fundraising">Fundraising</SelectItem></SelectContent></Select></div>
            <div><Label>Target Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{targetDate ? format(targetDate, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={targetDate} onSelect={setTargetDate} /></PopoverContent></Popover></div>
          </div>
          <div><Label>Link to Project (Optional)</Label><Select value={project} onValueChange={setProject}><SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select></div>
          {project && targets.length > 0 && <div><Label>Link to Target (Optional)</Label><Select value={target} onValueChange={setTarget}><SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger><SelectContent>{targets.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent></Select></div>}
          <div>
            <Label>Assign Team Members (Optional)</Label>
            <Select onValueChange={addTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.filter(m => !selectedTeamMembers.includes(m.id)).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTeamMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTeamMembers.map(memberId => {
                  const member = teamMembers.find(m => m.id === memberId);
                  return member ? (
                    <Badge key={memberId} variant="secondary" className="gap-1">
                      {member.firstName} {member.lastName}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeMember(memberId)} />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || loading}>{loading ? "Creating..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddGoalDialog;
