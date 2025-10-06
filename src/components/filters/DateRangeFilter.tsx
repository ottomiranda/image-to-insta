import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FilterState, DATE_PRESETS } from "@/types/filters";

interface DateRangeFilterProps {
  value: FilterState['dateRange'];
  onChange: (dateRange: FilterState['dateRange']) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (presetValue: string) => {
    const preset = DATE_PRESETS.find(p => p.value === presetValue);
    if (preset) {
      const range = preset.getRange();
      onChange({
        ...range,
        preset: preset.value,
      });
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    onChange({
      ...value,
      [field]: date,
      preset: 'custom',
    });
  };

  const clearFilter = () => {
    onChange({});
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const getDisplayText = () => {
    if (value.preset && value.preset !== 'custom') {
      const preset = DATE_PRESETS.find(p => p.value === value.preset);
      return preset ? t(preset.label) : t('filters.date.selectPeriod');
    }
    
    if (value.start && value.end) {
      return `${formatDate(value.start)} - ${formatDate(value.end)}`;
    }
    
    if (value.start) {
      return `A partir de ${formatDate(value.start)}`;
    }
    
    if (value.end) {
      return `Até ${formatDate(value.end)}`;
    }
    
    return t('filters.date.selectPeriod');
  };

  const hasValue = value.start || value.end || value.preset;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t('filters.date.label')}
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

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between ${hasValue ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="truncate">{getDisplayText()}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('filters.date.quickSelect')}
              </label>
              <Select value={value.preset || ''} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.date.selectPreset')} />
                </SelectTrigger>
                <SelectContent>
                  {DATE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {t(preset.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">
                {t('filters.date.customRange')}
              </label>
              
              {/* Data de início */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  {t('filters.date.startDate')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {value.start ? formatDate(value.start) : t('filters.date.selectStart')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={value.start}
                      onSelect={(date) => handleCustomDateChange('start', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data de fim */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  {t('filters.date.endDate')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {value.end ? formatDate(value.end) : t('filters.date.selectEnd')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={value.end}
                      onSelect={(date) => handleCustomDateChange('end', date)}
                      initialFocus
                      disabled={(date) => value.start ? date < value.start : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsOpen(false)} size="sm">
                {t('filters.apply')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasValue && (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {getDisplayText()}
          </Badge>
        </div>
      )}
    </div>
  );
};
