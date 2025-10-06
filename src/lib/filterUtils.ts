import { Campaign } from '@/types/campaign';
import {
  FilterState,
  FilterOptions,
  FilterOption,
  DEFAULT_FILTER_STATE,
} from '@/types/filters';

type OptionWithCount = FilterOption & { count: number };
type OptionAccumulator = Map<string, OptionWithCount>;

const normalizeList = (value?: string | string[] | null): string[] => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(/[,&]/);
  return items
    .map(item => (typeof item === 'string' ? item.trim() : String(item).trim()))
    .filter((item): item is string => item.length > 0);
};

const dedupeInsensitive = (values: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach(value => {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  });

  return result;
};

const getCampaignColors = (campaign: Campaign): string[] => {
  const values = [
    ...normalizeList(campaign.palette_hex),
    ...normalizeList(campaign.product?.colors),
    ...normalizeList(campaign.image_analysis?.colors),
    ...normalizeList(campaign.lookpost_schema?.dominant_colors),
  ];

  return dedupeInsensitive(values);
};

const getCampaignStyles = (campaign: Campaign): string[] => {
  const values = [
    ...normalizeList(campaign.image_analysis?.styleAesthetic),
    ...normalizeList(campaign.product?.style),
    ...normalizeList(campaign.lookpost_schema?.style_aesthetic),
  ];

  return dedupeInsensitive(values);
};

const getCampaignBudgets = (campaign: Campaign): string[] => {
  const values = [
    ...normalizeList(campaign.input?.budget_hint),
    ...normalizeList(campaign.lookpost_schema?.budget_category),
  ];

  return dedupeInsensitive(values);
};

const getCampaignOccasions = (campaign: Campaign): string[] => {
  const values = [
    ...normalizeList(campaign.input?.occasion),
    ...normalizeList(campaign.lookpost_schema?.occasion_event),
  ];

  return dedupeInsensitive(values);
};

const getCampaignAudiences = (campaign: Campaign): string[] => {
  const values = [
    ...normalizeList(campaign.input?.audience),
    ...normalizeList(campaign.lookpost_schema?.target_audience),
  ];

  return dedupeInsensitive(values);
};

const getComplianceScore = (campaign: Campaign): number =>
  campaign.brand_compliance_score ??
  campaign.brand_compliance_original_score ??
  0;

const campaignHasAdjustments = (campaign: Campaign): boolean => {
  const direct = campaign.brand_compliance_adjustments ?? [];
  const schema = campaign.lookpost_schema?.brand_compliance_adjustments ?? [];
  return direct.length > 0 || schema.length > 0;
};

const addOptions = (bucket: OptionAccumulator, values: string[]) => {
  values.forEach(value => {
    const key = value.toLowerCase();
    const existing = bucket.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      bucket.set(key, { value, label: value, count: 1 });
    }
  });
};

const toOptionsArray = (bucket: OptionAccumulator): FilterOption[] =>
  Array.from(bucket.values()).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

const toTimestamp = (value?: Date | string): number | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? null : time;
};

const cloneDefaultFilters = (): FilterState => ({
  textSearch: DEFAULT_FILTER_STATE.textSearch,
  dateRange: { ...DEFAULT_FILTER_STATE.dateRange },
  complianceScore: DEFAULT_FILTER_STATE.complianceScore
    ? { ...DEFAULT_FILTER_STATE.complianceScore }
    : null,
  colors: [...DEFAULT_FILTER_STATE.colors],
  styles: [...DEFAULT_FILTER_STATE.styles],
  budget: [...DEFAULT_FILTER_STATE.budget],
  occasion: [...DEFAULT_FILTER_STATE.occasion],
  audience: [...DEFAULT_FILTER_STATE.audience],
  hasAdjustments: [...DEFAULT_FILTER_STATE.hasAdjustments],
  sort: { ...DEFAULT_FILTER_STATE.sort },
});

export const applyFilters = (
  campaigns: Campaign[],
  filters: FilterState,
): Campaign[] => {
  let filtered = [...campaigns];

  const searchTerm = filters.textSearch?.trim().toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(campaign => {
      const corpus = [
        campaign.title,
        campaign.short_description,
        campaign.long_description,
        campaign.prompt,
        campaign.instagram?.caption,
        campaign.lookpost_schema?.prompt,
      ];

      return corpus.some(value => value?.toLowerCase().includes(searchTerm));
    });
  }

  const { start, end } = filters.dateRange ?? {};
  if (start || end) {
    const startTime = toTimestamp(start);
    const endTime = toTimestamp(end);

    filtered = filtered.filter(campaign => {
      const createdAt = toTimestamp(campaign.created_at) ?? 0;
      if (startTime !== null && createdAt < startTime) return false;
      if (endTime !== null && createdAt > endTime) return false;
      return true;
    });
  }

  if (filters.complianceScore) {
    const { min, max } = filters.complianceScore;
    filtered = filtered.filter(campaign => {
      const score = getComplianceScore(campaign);
      return score >= min && score <= max;
    });
  }

  if (filters.colors.length > 0) {
    filtered = filtered.filter(campaign => {
      const campaignColors = getCampaignColors(campaign).map(value =>
        value.toLowerCase(),
      );
      if (campaignColors.length === 0) return false;
      return filters.colors.some(filterColor =>
        campaignColors.includes(filterColor.toLowerCase()),
      );
    });
  }

  if (filters.styles.length > 0) {
    filtered = filtered.filter(campaign => {
      const campaignStyles = getCampaignStyles(campaign).map(value =>
        value.toLowerCase(),
      );
      if (campaignStyles.length === 0) return false;
      return filters.styles.some(filterStyle =>
        campaignStyles.includes(filterStyle.toLowerCase()),
      );
    });
  }

  if (filters.budget.length > 0) {
    filtered = filtered.filter(campaign => {
      const campaignBudgets = getCampaignBudgets(campaign).map(value =>
        value.toLowerCase(),
      );
      if (campaignBudgets.length === 0) return false;
      return filters.budget.some(filterBudget =>
        campaignBudgets.includes(filterBudget.toLowerCase()),
      );
    });
  }

  if (filters.occasion.length > 0) {
    filtered = filtered.filter(campaign => {
      const campaignOccasions = getCampaignOccasions(campaign).map(value =>
        value.toLowerCase(),
      );
      if (campaignOccasions.length === 0) return false;
      return filters.occasion.some(filterOccasion =>
        campaignOccasions.includes(filterOccasion.toLowerCase()),
      );
    });
  }

  if (filters.audience.length > 0) {
    filtered = filtered.filter(campaign => {
      const campaignAudiences = getCampaignAudiences(campaign).map(value =>
        value.toLowerCase(),
      );
      if (campaignAudiences.length === 0) return false;
      return filters.audience.some(filterAudience =>
        campaignAudiences.includes(filterAudience.toLowerCase()),
      );
    });
  }

  if (filters.hasAdjustments.length > 0) {
    const includeWith = filters.hasAdjustments.includes('with');
    const includeWithout = filters.hasAdjustments.includes('without');

    filtered = filtered.filter(campaign => {
      const hasAdjustments = campaignHasAdjustments(campaign);
      if (includeWith && hasAdjustments) return true;
      if (includeWithout && !hasAdjustments) return true;
      return false;
    });
  }

  const sortBy = filters.sort?.sortBy ?? DEFAULT_FILTER_STATE.sort.sortBy;
  const direction = filters.sort?.direction ?? DEFAULT_FILTER_STATE.sort.direction;
  const directionFactor = direction === 'desc' ? -1 : 1;

  const sorted = [...filtered].sort((a, b) => {
    const compare = (): number => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'brand_compliance_score':
          return getComplianceScore(a) - getComplianceScore(b);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'published_at':
          return (toTimestamp(a.published_at) ?? 0) - (toTimestamp(b.published_at) ?? 0);
        case 'scheduled_at':
          return (toTimestamp(a.scheduled_at) ?? 0) - (toTimestamp(b.scheduled_at) ?? 0);
        case 'created_at':
        default:
          return (toTimestamp(a.created_at) ?? 0) - (toTimestamp(b.created_at) ?? 0);
      }
    };

    return compare() * directionFactor;
  });

  return sorted;
};

export const extractFilterOptions = (campaigns: Campaign[]): FilterOptions => {
  const colorOptions: OptionAccumulator = new Map();
  const styleOptions: OptionAccumulator = new Map();
  const budgetOptions: OptionAccumulator = new Map();
  const occasionOptions: OptionAccumulator = new Map();
  const audienceOptions: OptionAccumulator = new Map();
  let withAdjustments = 0;
  let withoutAdjustments = 0;

  campaigns.forEach(campaign => {
    addOptions(colorOptions, getCampaignColors(campaign));
    addOptions(styleOptions, getCampaignStyles(campaign));
    addOptions(budgetOptions, getCampaignBudgets(campaign));
    addOptions(occasionOptions, getCampaignOccasions(campaign));
    addOptions(audienceOptions, getCampaignAudiences(campaign));

    if (campaignHasAdjustments(campaign)) {
      withAdjustments += 1;
    } else {
      withoutAdjustments += 1;
    }
  });

  const hasAdjustmentsOptions: FilterOption[] = [
    { value: 'with', label: 'Com ajustes', count: withAdjustments },
    { value: 'without', label: 'Sem ajustes', count: withoutAdjustments },
  ];

  return {
    colors: toOptionsArray(colorOptions),
    styles: toOptionsArray(styleOptions),
    budget: toOptionsArray(budgetOptions),
    occasion: toOptionsArray(occasionOptions),
    audience: toOptionsArray(audienceOptions),
    hasAdjustments: hasAdjustmentsOptions,
  };
};

export const countActiveFilters = (filters: FilterState): number => {
  let count = 0;

  if (filters.textSearch?.trim()) count += 1;
  if (filters.dateRange.start || filters.dateRange.end) count += 1;
  if (
    filters.complianceScore &&
    (filters.complianceScore.min > 0 || filters.complianceScore.max < 100)
  ) {
    count += 1;
  }
  if (filters.colors.length > 0) count += 1;
  if (filters.styles.length > 0) count += 1;
  if (filters.budget.length > 0) count += 1;
  if (filters.occasion.length > 0) count += 1;
  if (filters.audience.length > 0) count += 1;
  if (filters.hasAdjustments.length > 0) count += 1;
  if (
    filters.sort.sortBy !== DEFAULT_FILTER_STATE.sort.sortBy ||
    filters.sort.direction !== DEFAULT_FILTER_STATE.sort.direction
  ) {
    count += 1;
  }

  return count;
};

export const resetFilters = (): FilterState => cloneDefaultFilters();

export const isValidFilter = (filters: FilterState): boolean => {
  const { complianceScore, dateRange } = filters;

  if (complianceScore) {
    const { min, max } = complianceScore;
    if (
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      min < 0 ||
      max > 100 ||
      min > max
    ) {
      return false;
    }
  }

  if (dateRange.start && dateRange.end) {
    const start = toTimestamp(dateRange.start);
    const end = toTimestamp(dateRange.end);
    if (start !== null && end !== null && start > end) return false;
  }

  return true;
};

