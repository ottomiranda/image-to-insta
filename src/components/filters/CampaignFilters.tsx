import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { FilterState, FilterOptions } from '@/types/filters';
import { DateRangeFilter } from './DateRangeFilter';
import { ComplianceScoreFilter } from './ComplianceScoreFilter';
import { MultiSelectFilter } from './MultiSelectFilter';
import { cn } from '@/lib/utils';

interface CampaignFiltersProps {
  filters: FilterState;
  filterOptions: FilterOptions;
  activeFiltersCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onClearFilter: (filterKey: keyof FilterState) => void;
  onDateRangeChange: (dateRange: FilterState['dateRange']) => void;
  onComplianceScoreChange: (complianceScore: FilterState['complianceScore']) => void;
  onColorsChange: (colors: string[]) => void;
  onStylesChange: (styles: string[]) => void;
  onBudgetChange: (budget: string[]) => void;
  onOccasionChange: (occasion: string[]) => void;
  onAudienceChange: (audience: string[]) => void;
  onHasAdjustmentsChange: (hasAdjustments: string[]) => void;
  className?: string;
}

export const CampaignFilters: React.FC<CampaignFiltersProps> = ({
  filters,
  filterOptions,
  activeFiltersCount,
  hasActiveFilters,
  onResetFilters,
  onClearFilter,
  onDateRangeChange,
  onComplianceScoreChange,
  onColorsChange,
  onStylesChange,
  onBudgetChange,
  onOccasionChange,
  onAudienceChange,
  onHasAdjustmentsChange,
  className
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const localizedHasAdjustments = useMemo(() => {
    return filterOptions.hasAdjustments.map(option => ({
      ...option,
      label:
        option.value === 'with'
          ? t('filters.adjustments.with')
          : option.value === 'without'
          ? t('filters.adjustments.without')
          : option.label,
    }));
  }, [filterOptions.hasAdjustments, t]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            {t('filters.title')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-8 px-2 text-xs"
              >
                {t('filters.clearAll')}
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6 pr-4">
                {/* Date Range Filter */}
                <DateRangeFilter
                  value={filters.dateRange}
                  onChange={onDateRangeChange}
                />

                {/* Compliance Score Filter */}
                <ComplianceScoreFilter
                  value={filters.complianceScore}
                  onChange={onComplianceScoreChange}
                />

                {/* Colors Filter */}
                <MultiSelectFilter
                  label={t('filters.colors.label')}
                  options={filterOptions.colors}
                  value={filters.colors}
                  onChange={onColorsChange}
                  placeholder={t('filters.colors.placeholder')}
                />

                {/* Styles Filter */}
                <MultiSelectFilter
                  label={t('filters.styles.label')}
                  options={filterOptions.styles}
                  value={filters.styles}
                  onChange={onStylesChange}
                  placeholder={t('filters.styles.placeholder')}
                />

                {/* Budget Filter */}
                <MultiSelectFilter
                  label={t('filters.budget.label')}
                  options={filterOptions.budget}
                  value={filters.budget}
                  onChange={onBudgetChange}
                  placeholder={t('filters.budget.placeholder')}
                />

                {/* Occasion Filter */}
                <MultiSelectFilter
                  label={t('filters.occasion.label')}
                  options={filterOptions.occasion}
                  value={filters.occasion}
                  onChange={onOccasionChange}
                  placeholder={t('filters.occasion.placeholder')}
                />

                {/* Audience Filter */}
                <MultiSelectFilter
                  label={t('filters.audience.label')}
                  options={filterOptions.audience}
                  value={filters.audience}
                  onChange={onAudienceChange}
                  placeholder={t('filters.audience.placeholder')}
                />

                {/* Has Adjustments Filter */}
                <MultiSelectFilter
                  label={t('filters.adjustments.label')}
                  options={localizedHasAdjustments}
                  value={filters.hasAdjustments}
                  onChange={onHasAdjustmentsChange}
                  placeholder={t('filters.adjustments.placeholder')}
                />
              </div>
            </ScrollArea>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {filters.textSearch && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.search.label')}: {filters.textSearch}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('textSearch')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {(filters.dateRange?.start || filters.dateRange?.end) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.date.label')}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('dateRange')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.complianceScore && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.compliance.label')}: {filters.complianceScore.min}-{filters.complianceScore.max}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('complianceScore')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.colors.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.colors.label')} ({filters.colors.length})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('colors')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.styles.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.styles.label')} ({filters.styles.length})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('styles')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.budget.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.budget.label')} ({filters.budget.length})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('budget')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.occasion.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.occasion.label')} ({filters.occasion.length})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('occasion')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.audience.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.audience.label')} ({filters.audience.length})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('audience')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.hasAdjustments.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {t('filters.adjustments.label')} ({filters.hasAdjustments.length})
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onClearFilter('hasAdjustments')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
