import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export type LogoPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "center-left" 
  | "center" 
  | "center-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right";

interface LogoPositionSelectorProps {
  includeLogo: boolean;
  onIncludeLogoChange: (include: boolean) => void;
  logoPosition: LogoPosition;
  onLogoPositionChange: (position: LogoPosition) => void;
  hasLogo: boolean;
}

export const LogoPositionSelector = ({
  includeLogo,
  onIncludeLogoChange,
  logoPosition,
  onLogoPositionChange,
  hasLogo,
}: LogoPositionSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeLogo"
          checked={includeLogo}
          onCheckedChange={(checked) => onIncludeLogoChange(checked === true)}
          disabled={!hasLogo}
        />
        <Label
          htmlFor="includeLogo"
          className={!hasLogo ? "text-muted-foreground" : "cursor-pointer"}
        >
          {t('create.includeBrandLogo')}
        </Label>
      </div>

      {!hasLogo && (
        <p className="text-sm text-muted-foreground">
          {t('create.uploadLogoFirst')}
        </p>
      )}

      {includeLogo && hasLogo && (
        <div className="space-y-2">
          <Label htmlFor="logoPosition">{t('create.logoPosition')}</Label>
          <Select value={logoPosition} onValueChange={(value) => onLogoPositionChange(value as LogoPosition)}>
            <SelectTrigger id="logoPosition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-left">{t('create.logoPositions.topLeft')}</SelectItem>
              <SelectItem value="top-center">{t('create.logoPositions.topCenter')}</SelectItem>
              <SelectItem value="top-right">{t('create.logoPositions.topRight')}</SelectItem>
              <SelectItem value="center-left">{t('create.logoPositions.centerLeft')}</SelectItem>
              <SelectItem value="center">{t('create.logoPositions.center')}</SelectItem>
              <SelectItem value="center-right">{t('create.logoPositions.centerRight')}</SelectItem>
              <SelectItem value="bottom-left">{t('create.logoPositions.bottomLeft')}</SelectItem>
              <SelectItem value="bottom-center">{t('create.logoPositions.bottomCenter')}</SelectItem>
              <SelectItem value="bottom-right">{t('create.logoPositions.bottomRight')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
