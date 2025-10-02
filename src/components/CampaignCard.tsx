import { Campaign } from "@/types/campaign";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Copy, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onPublish: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onDelete, onPublish }: CampaignCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (campaign.status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getTimestamp = () => {
    if (campaign.published_at) {
      return `Published ${formatDistanceToNow(new Date(campaign.published_at), { addSuffix: true })}`;
    }
    if (campaign.scheduled_at) {
      return `Scheduled for ${new Date(campaign.scheduled_at).toLocaleDateString()}`;
    }
    return formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={campaign.look_visual}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold truncate">{campaign.title}</h3>
              <p className="text-sm text-muted-foreground">{getTimestamp()}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/create/${campaign.id}`)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPublish(campaign)}>
                  <Send className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {getStatusBadge()}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign "{campaign.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(campaign.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
