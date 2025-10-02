import { useState } from "react";
import { RectangleHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AspectRatioSelectorProps {
  onSelectRatio: (ratio: string) => void;
  selectedRatio: string | null;
}

// Available aspect ratios organized by category
const ASPECT_RATIOS = {
  portrait: [
    { label: "9:16", value: "9:16" },
    { label: "10:16", value: "10:16" },
    { label: "2:3", value: "2:3" },
    { label: "3:4", value: "3:4" },
    { label: "4:5", value: "4:5" },
  ],
  landscape: [
    { label: "16:9", value: "16:9" },
    { label: "16:10", value: "16:10" },
    { label: "3:2", value: "3:2" },
    { label: "4:3", value: "4:3" },
    { label: "5:4", value: "5:4" },
  ],
  square: [
    { label: "1:1", value: "1:1" },
  ],
};

export function AspectRatioSelector({ onSelectRatio, selectedRatio }: AspectRatioSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSelect = (ratio: string) => {
    onSelectRatio(ratio);
    setOpen(false);
  };

  // Calculate preview dimensions based on selected ratio
  const getPreviewDimensions = (ratio: string) => {
    const [w, h] = ratio.split(":").map(Number);
    const maxDimension = 150;
    const aspectRatio = w / h;
    
    if (aspectRatio > 1) {
      // Landscape
      return { width: maxDimension, height: maxDimension / aspectRatio };
    } else {
      // Portrait or Square
      return { width: maxDimension * aspectRatio, height: maxDimension };
    }
  };

  // Calculate pixel dimensions for display
  const getPixelDimensions = (ratio: string) => {
    const ratioMap: Record<string, { width: number; height: number }> = {
      "16:9": { width: 1920, height: 1080 },
      "9:16": { width: 1080, height: 1920 },
      "16:10": { width: 1920, height: 1200 },
      "10:16": { width: 1200, height: 1920 },
      "4:3": { width: 1600, height: 1200 },
      "3:4": { width: 1200, height: 1600 },
      "3:2": { width: 1620, height: 1080 },
      "2:3": { width: 1080, height: 1620 },
      "5:4": { width: 1280, height: 1024 },
      "4:5": { width: 1024, height: 1280 },
      "1:1": { width: 1024, height: 1024 },
    };
    return ratioMap[ratio] || { width: 1024, height: 1024 };
  };

  const previewDims = selectedRatio ? getPreviewDimensions(selectedRatio) : { width: 150, height: 150 };
  const pixelDims = selectedRatio ? getPixelDimensions(selectedRatio) : { width: 1024, height: 1024 };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          title={t('create.aspectRatio')}
        >
          <RectangleHorizontal className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">{t('create.selectAspectRatio')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-[200px,1fr] gap-6 py-4">
          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center h-[200px] bg-gray-950 border border-white/20 rounded-lg">
              <div
                className="bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-white rounded"
                style={{
                  width: `${previewDims.width}px`,
                  height: `${previewDims.height}px`,
                }}
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400">{t('create.width')}</p>
              <p className="text-sm font-medium text-white">{pixelDims.width}px</p>
              <p className="text-xs text-gray-400 mt-2">{t('create.height')}</p>
              <p className="text-sm font-medium text-white">{pixelDims.height}px</p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Portrait Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                {t('create.portrait')}
              </h3>
              <div className="space-y-2">
                {ASPECT_RATIOS.portrait.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => handleSelect(ratio.value)}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-lg border transition-all text-left font-medium",
                      selectedRatio === ratio.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-gray-800 border-white/10 text-gray-300 hover:bg-gray-700 hover:border-white/20"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Landscape Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                {t('create.landscape')}
              </h3>
              <div className="space-y-2">
                {ASPECT_RATIOS.landscape.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => handleSelect(ratio.value)}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-lg border transition-all text-left font-medium",
                      selectedRatio === ratio.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-gray-800 border-white/10 text-gray-300 hover:bg-gray-700 hover:border-white/20"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Square - Full Width */}
            <div className="col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                {t('create.square')}
              </h3>
              <div className="space-y-2">
                {ASPECT_RATIOS.square.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => handleSelect(ratio.value)}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-lg border transition-all text-left font-medium",
                      selectedRatio === ratio.value
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-gray-800 border-white/10 text-gray-300 hover:bg-gray-700 hover:border-white/20"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
