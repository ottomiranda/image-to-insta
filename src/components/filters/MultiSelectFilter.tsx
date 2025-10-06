import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { FilterOption } from "@/types/filters";

interface MultiSelectFilterProps {
  label: string;
  value: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxHeight?: string;
}

export const MultiSelectFilter = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  searchable = true,
  maxHeight = "200px"
}: MultiSelectFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === filteredOptions.length) {
      onChange([]);
    } else {
      onChange(filteredOptions.map(option => option.value));
    }
  };

  const clearFilter = () => {
    onChange([]);
  };

  const removeItem = (itemValue: string) => {
    onChange(value.filter(v => v !== itemValue));
  };

  const getSelectedLabels = () => {
    return value
      .map(v => options.find(opt => opt.value === v)?.label)
      .filter(Boolean) as string[];
  };

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder || t('filters.selectOptions');
    }
    if (value.length === 1) {
      return getSelectedLabels()[0];
    }
    return t('filters.selectedCount', { count: value.length });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        {value.length > 0 && (
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
            className={`w-full justify-between ${value.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 space-y-3">
            {/* Search */}
            {searchable && (
              <Input
                placeholder={t('filters.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            )}

            {/* Select All */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-6 px-2 text-xs"
              >
                {value.length === filteredOptions.length ? t('filters.deselectAll') : t('filters.selectAll')}
              </Button>
              <span className="text-xs text-muted-foreground">
                {value.length}/{options.length}
              </span>
            </div>

            {/* Options */}
            <ScrollArea className="h-48" style={{ maxHeight }}>
              <div className="space-y-2">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm cursor-pointer"
                    onClick={() => handleToggle(option.value)}
                  >
                    <Checkbox
                      checked={value.includes(option.value)}
                      onChange={() => handleToggle(option.value)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    {searchTerm ? t('filters.noResults') : t('filters.noOptions')}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={() => setIsOpen(false)} size="sm">
                {t('filters.apply')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {getSelectedLabels().slice(0, 3).map((label, index) => (
            <Badge
              key={value[index]}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              {label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(value[index]);
                }}
              />
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 3} {t('filters.more')}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
