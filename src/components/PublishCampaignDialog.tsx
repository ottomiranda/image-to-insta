import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PublishCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (publishType: "now" | "schedule", scheduledDate?: Date) => void;
}

export function PublishCampaignDialog({ open, onOpenChange, onPublish }: PublishCampaignDialogProps) {
  const [publishType, setPublishType] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<Date>();

  const handleConfirm = () => {
    onPublish(publishType, scheduledDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Campaign</DialogTitle>
        </DialogHeader>

        <RadioGroup value={publishType} onValueChange={(v) => setPublishType(v as "now" | "schedule")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="now" id="now" />
            <Label htmlFor="now">Publish Now</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="schedule" id="schedule" />
            <Label htmlFor="schedule">Schedule</Label>
          </div>
        </RadioGroup>

        {publishType === "schedule" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !scheduledDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={publishType === "schedule" && !scheduledDate}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
