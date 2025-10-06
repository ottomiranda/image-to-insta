import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RangeSlider } from "@/components/ui/range-slider";
import { useTranslation } from "react-i18next";
import { FilterState, COMPLIANCE_RANGES } from "@/types/filters";

interface ComplianceScoreFilterProps {
  value: FilterState['complianceScore'];
  onChange: (range: FilterState['complianceScore']) => void;
}

export const ComplianceScoreFilter = ({ value, onChange }: ComplianceScoreFilterProps) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState<[number, number]>([
    value?.min ?? 0,
    value?.max ?? 100
  ]);

  useEffect(() => {
    setLocalValue([value?.min ?? 0, value?.max ?? 100]);
  }, [value?.min, value?.max]);

  const handleRangeChange = (newValue: number[]) => {
    const [min, max] = newValue;
    setLocalValue([min, max]);
    onChange({ min, max });
  };

  const handlePresetClick = (preset: typeof COMPLIANCE_RANGES[0]) => {
    const newValue: [number, number] = [preset.min, preset.max];
    setLocalValue(newValue);
    onChange({ min: preset.min, max: preset.max });
  };

  const clearFilter = () => {
    setLocalValue([0, 100]);
    onChange(null);
  };

  const hasValue = value && (value.min > 0 || value.max < 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (min: number, max: number) => {
    if (min === 0 && max === 100) return t('filters.compliance.all');
    if (min === max) return `${min}%`;
    return `${min}% - ${max}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t('filters.compliance.label')}
        </label>
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {t('filters.clear')}
          </Button>
        )}
      </div>

      {/* Range Slider */}
      <div className="space-y-3">
        <RangeSlider
          value={localValue}
          onValueChange={handleRangeChange}
          max={100}
          min={0}
          step={5}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span className={getScoreColor((localValue[0] + localValue[1]) / 2)}>
            {getScoreLabel(localValue[0], localValue[1])}
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          {t('filters.compliance.quickSelect')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COMPLIANCE_RANGES.map((preset) => (
            <Button
              key={preset.label}
              variant={
                value?.min === preset.min && value?.max === preset.max
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="text-xs h-8"
            >
              <span className={getScoreColor((preset.min + preset.max) / 2)}>
                {t(preset.label)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Current Selection Display */}
      {hasValue && (
        <div className="flex flex-wrap gap-1">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getScoreColor((localValue[0] + localValue[1]) / 2)}`}
          >
            Score: {getScoreLabel(localValue[0], localValue[1])}
          </Badge>
        </div>
      )}

      {/* Score Legend */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>80-100%: {t('filters.compliance.excellent')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>60-79%: {t('filters.compliance.good')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>0-59%: {t('filters.compliance.needsImprovement')}</span>
        </div>
      </div>
    </div>
  );
};
