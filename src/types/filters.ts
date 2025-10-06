export interface FilterState {
  textSearch: string;
  dateRange: {
    start?: Date;
    end?: Date;
    preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
  };
  complianceScore: {
    min: number;
    max: number;
  } | null;
  colors: string[];
  styles: string[];
  budget: string[];
  occasion: string[];
  audience: string[];
  hasAdjustments: string[];
  sort: {
    sortBy: 'created_at' | 'title' | 'brand_compliance_score' | 'status' | 'published_at' | 'scheduled_at';
    direction: 'asc' | 'desc';
  };
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptions {
  colors: FilterOption[];
  styles: FilterOption[];
  budget: FilterOption[];
  occasion: FilterOption[];
  audience: FilterOption[];
  hasAdjustments: FilterOption[];
}

export interface DatePreset {
  value: FilterState['dateRange']['preset'];
  label: string;
  getRange: () => { start: Date; end: Date };
}

export interface ComplianceRange {
  min: number;
  max: number;
  label: string;
  color: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  textSearch: '',
  dateRange: {},
  complianceScore: null,
  colors: [],
  styles: [],
  budget: [],
  occasion: [],
  audience: [],
  hasAdjustments: [],
  sort: {
    sortBy: 'created_at',
    direction: 'desc',
  },
};

export const COMPLIANCE_RANGES: ComplianceRange[] = [
  { min: 90, max: 100, label: 'filters.compliance.excellent', color: 'green' },
  { min: 70, max: 89, label: 'filters.compliance.good', color: 'blue' },
  { min: 50, max: 69, label: 'filters.compliance.regular', color: 'yellow' },
  { min: 0, max: 49, label: 'filters.compliance.needsImprovement', color: 'red' },
];

export const DATE_PRESETS: DatePreset[] = [
  {
    value: 'today',
    label: 'filters.date.today',
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { start: today, end: tomorrow };
    }
  },
  {
    value: 'yesterday',
    label: 'filters.date.yesterday',
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);
      return { start: yesterday, end: today };
    }
  },
  {
    value: 'last7days',
    label: 'filters.date.last7days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start, end };
    }
  },
  {
    value: 'last30days',
    label: 'filters.date.last30days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start, end };
    }
  },
  {
    value: 'thisMonth',
    label: 'filters.date.thisMonth',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    }
  },
  {
    value: 'lastMonth',
    label: 'filters.date.lastMonth',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    }
  }
];

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'filters.sort.createdAt' },
  { value: 'title', label: 'filters.sort.title' },
  { value: 'brand_compliance_score', label: 'filters.sort.complianceScore' },
  { value: 'status', label: 'filters.sort.status' },
  { value: 'published_at', label: 'filters.sort.publishedAt' },
  { value: 'scheduled_at', label: 'filters.sort.scheduledAt' }
] as const;