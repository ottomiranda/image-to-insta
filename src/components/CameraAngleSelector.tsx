import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

const CAMERA_ANGLES = [
  { value: "Close-up", labelKey: "closeUp" },
  { value: "Medium shot", labelKey: "mediumShot" },
  { value: "Wide shot", labelKey: "wideShot" },
  { value: "Overhead view", labelKey: "overheadView" },
  { value: "Bird's eye view", labelKey: "birdsEyeView" },
  { value: "Eye level", labelKey: "eyeLevel" },
  { value: "Low angle", labelKey: "lowAngle" },
  { value: "High angle", labelKey: "highAngle" },
  { value: "Worm's eye view", labelKey: "wormsEyeView" },
  { value: "Dutch angle", labelKey: "dutchAngle" },
  { value: "Side view", labelKey: "sideView" },
  { value: "Rear view", labelKey: "rearView" },
  { value: "Frontal", labelKey: "frontal" },
  { value: "3/4 view", labelKey: "threeQuarterView" },
  { value: "Extreme close-up", labelKey: "extremeCloseUp" },
  { value: "Full body shot", labelKey: "fullBodyShot" },
  { value: "Portrait", labelKey: "portrait" },
  { value: "Selfie", labelKey: "selfie" },
  { value: "Zenital", labelKey: "zenital" },
  { value: "Over-the-shoulder", labelKey: "overTheShoulder" },
];

interface CameraAngleSelectorProps {
  onSelectAngle: (angle: string) => void;
  selectedAngle: string | null;
}

export function CameraAngleSelector({ onSelectAngle, selectedAngle }: CameraAngleSelectorProps) {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 hover:bg-white/10"
          aria-label={t('create.selectAngle')}
        >
          <Video className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-h-96 overflow-y-auto p-2" align="start">
        <div className="space-y-1">
          <p className="text-sm font-medium px-2 py-1.5 text-muted-foreground">
            {t('create.cameraAngle')}
          </p>
          {CAMERA_ANGLES.map((angle) => (
            <button
              key={angle.value}
              onClick={() => onSelectAngle(angle.value)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent/50 ${
                selectedAngle === angle.value ? 'bg-accent/30' : ''
              }`}
            >
              {t(`create.cameraAngles.${angle.labelKey}`)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
