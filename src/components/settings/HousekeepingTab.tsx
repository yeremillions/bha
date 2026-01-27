import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save, Loader2 } from "lucide-react";

interface HousekeepingTabProps {
  assignmentMode: string;
  setAssignmentMode: (mode: string) => void;
  autoCreate: boolean;
  setAutoCreate: (value: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const HousekeepingTab = ({ 
  assignmentMode, 
  setAssignmentMode, 
  autoCreate, 
  setAutoCreate, 
  onSave, 
  isSaving 
}: HousekeepingTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-display">
        <Sparkles className="h-5 w-5 text-primary" />
        Housekeeping Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assignmentMode">Task Assignment Mode</Label>
          <Select value={assignmentMode} onValueChange={setAssignmentMode}>
            <SelectTrigger id="assignmentMode">
              <SelectValue placeholder="Select assignment mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic Assignment</SelectItem>
              <SelectItem value="manual">Manual Assignment</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {assignmentMode === 'automatic'
              ? 'Tasks will be automatically assigned to available staff based on workload, ratings, and availability.'
              : 'Tasks will remain unassigned until manually assigned by a manager.'}
          </p>
        </div>

        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex-1 space-y-1">
            <Label htmlFor="autoCreate" className="text-base font-medium">
              Auto-Create Tasks on Checkout
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically create housekeeping tasks when guests check out
            </p>
          </div>
          <Switch id="autoCreate" checked={autoCreate} onCheckedChange={setAutoCreate} />
        </div>

        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            {[
              "When a booking is marked as completed (checked out), a checkout cleaning task is automatically created",
              "In automatic mode, the task is immediately assigned to the best available staff member",
              "In manual mode, the task waits in the unassigned queue for manager assignment",
              "Auto-assignment considers: staff workload, performance ratings, and task priority",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
);
