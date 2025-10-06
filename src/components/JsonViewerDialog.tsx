import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Copy } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { buildLookPostJson } from "@/lib/lookpost";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface JsonViewerDialogProps {
  campaign: Campaign;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function JsonViewerDialog({ 
  campaign,
  variant = "ghost",
  size = "sm"
}: JsonViewerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  const jsonData = buildLookPostJson(campaign);
  const jsonString = JSON.stringify(jsonData, null, 2);
  
  const copyJson = () => {
    navigator.clipboard.writeText(jsonString);
    toast({
      title: t('lookpost.copied'),
      description: t('lookpost.copiedDesc'),
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Eye className="h-4 w-4 mr-2" />
          {t('lookpost.viewJson')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('lookpost.jsonPreview')}</span>
            <Button variant="ghost" size="sm" onClick={copyJson}>
              <Copy className="h-4 w-4 mr-2" />
              {t('lookpost.copy')}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <pre className="text-xs">
            <code>{jsonString}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
