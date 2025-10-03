import { useState } from "react";
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

// Dynamic icon that reflects the selected aspect ratio
const DynamicAspectRatioIcon = ({ ratio }: { ratio: string | null }) => {
  if (!ratio) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="7" width="10" height="6" stroke="currentColor" strokeWidth="1.5" rx="1" />
      </svg>
    );
  }
  
  const [w, h] = ratio.split(":").map(Number);
  const aspectRatio = w / h;
  
  // Calculate icon dimensions (fixed area approach)
  const iconSize = 16;
  let width, height;
  
  if (aspectRatio > 1) {
    // Landscape
    width = iconSize;
    height = iconSize / aspectRatio;
  } else if (aspectRatio < 1) {
    // Portrait
    height = iconSize;
    width = iconSize * aspectRatio;
  } else {
    // Square
    width = height = iconSize;
  }
  
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x={(20 - width) / 2}
        y={(20 - height) / 2}
        width={width}
        height={height}
        stroke="currentColor"
        strokeWidth="1.5"
        rx="1"
      />
    </svg>
  );
};

export function AspectRatioSelector({ onSelectRatio, selectedRatio }: AspectRatioSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSelect = (ratio: string) => {
    onSelectRatio(ratio);
    // Panel remains open - closes only when user clicks outside
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

  const effectiveRatio = selectedRatio || "1:1";
  const previewDims = getPreviewDimensions(effectiveRatio);
  const pixelDims = getPixelDimensions(effectiveRatio);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          title={t('create.aspectRatio')}
        >
          <DynamicAspectRatioIcon ratio={selectedRatio || "1:1"} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">{t('create.selectAspectRatio')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-[200px,1fr] gap-6 py-4">
          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center h-[200px] bg-background/50 border border-white/10 rounded-lg">
              <div
                className="bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-primary/50 rounded"
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
                      "w-full px-4 py-2.5 rounded-lg border-2 transition-all text-left font-medium hover:scale-105",
                      selectedRatio === ratio.value
                        ? "border-primary shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-primary/10 text-white"
                        : "border-white/10 hover:border-white/30 bg-background/30 text-foreground"
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
                      "w-full px-4 py-2.5 rounded-lg border-2 transition-all text-left font-medium hover:scale-105",
                      selectedRatio === ratio.value
                        ? "border-primary shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-primary/10 text-white"
                        : "border-white/10 hover:border-white/30 bg-background/30 text-foreground"
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
                      "w-full px-4 py-2.5 rounded-lg border-2 transition-all text-left font-medium hover:scale-105",
                      selectedRatio === ratio.value
                        ? "border-primary shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-primary/10 text-white"
                        : "border-white/10 hover:border-white/30 bg-background/30 text-foreground"
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
