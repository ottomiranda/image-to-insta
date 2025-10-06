import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { FilterState, SORT_OPTIONS } from "@/types/filters";

interface SortFilterProps {
  value: FilterState['sort'];
  onChange: (sort: FilterState['sort']) => void;
}

export const SortFilter = ({ value, onChange }: SortFilterProps) => {
  const { t } = useTranslation();

  const handleSortChange = (sortBy: string) => {
    onChange({
      ...value,
      sortBy: sortBy as FilterState['sort']['sortBy'],
    });
  };

  const handleDirectionToggle = () => {
    onChange({
      ...value,
      direction: value.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearSort = () => {
    onChange({
      sortBy: 'created_at',
      direction: 'desc',
    });
  };

  const currentSort = SORT_OPTIONS.find(option => option.value === value.sortBy);
  const isDefaultSort = value.sortBy === 'created_at' && value.direction === 'desc';

  const getSortIcon = () => {
    if (value.direction === 'asc') {
      return <ArrowUp className="h-4 w-4" />;
    }
    return <ArrowDown className="h-4 w-4" />;
  };

  const getDirectionLabel = () => {
    if (value.direction === 'asc') {
      return t('filters.sort.ascending');
    }
    return t('filters.sort.descending');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t('filters.sort.label')}
        </label>
        {!isDefaultSort && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSort}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {t('filters.clear')}
          </Button>
        )}
      </div>

      {/* Sort Field Selection */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          {t('filters.sort.sortBy')}
        </label>
        <Select value={value.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Direction */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          {t('filters.sort.direction')}
        </label>
        <Button
          variant="outline"
          onClick={handleDirectionToggle}
          className="w-full justify-between"
        >
          <span>{getDirectionLabel()}</span>
          {getSortIcon()}
        </Button>
      </div>

      {/* Current Sort Display */}
      {!isDefaultSort && (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            {t(currentSort?.label || '')} ({getDirectionLabel()})
          </Badge>
        </div>
      )}

      {/* Sort Presets */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          {t('filters.sort.quickSort')}
        </label>
        <div className="grid grid-cols-1 gap-1">
          <Button
            variant={value.sortBy === 'created_at' && value.direction === 'desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ sortBy: 'created_at', direction: 'desc' })}
            className="text-xs h-8 justify-start"
          >
            {t('filters.sort.newest')}
          </Button>
          <Button
            variant={value.sortBy === 'created_at' && value.direction === 'asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ sortBy: 'created_at', direction: 'asc' })}
            className="text-xs h-8 justify-start"
          >
            {t('filters.sort.oldest')}
          </Button>
          <Button
            variant={value.sortBy === 'brand_compliance_score' && value.direction === 'desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ sortBy: 'brand_compliance_score', direction: 'desc' })}
            className="text-xs h-8 justify-start"
          >
            {t('filters.sort.bestScore')}
          </Button>
          <Button
            variant={value.sortBy === 'title' && value.direction === 'asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange({ sortBy: 'title', direction: 'asc' })}
            className="text-xs h-8 justify-start"
          >
            {t('filters.sort.alphabetical')}
          </Button>
        </div>
      </div>
    </div>
  );
};