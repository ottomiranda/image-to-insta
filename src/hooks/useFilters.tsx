import { useState, useMemo, useCallback, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { FilterState, FilterOptions, DEFAULT_FILTER_STATE } from '@/types/filters';
import { applyFilters, extractFilterOptions, countActiveFilters, isValidFilter } from '@/lib/filterUtils';
import { useDebounce } from './useDebounce';

const STORAGE_KEY = 'campaign-filters-v1';

// Hook para persistência no localStorage
const useFilterPersistence = () => {
  const saveFilters = useCallback((filters: FilterState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }, []);

  const loadFilters = useCallback((): Partial<FilterState> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter strings de data de volta para objetos Date
        if (parsed.dateRange?.start) {
          parsed.dateRange.start = new Date(parsed.dateRange.start);
        }
        if (parsed.dateRange?.end) {
          parsed.dateRange.end = new Date(parsed.dateRange.end);
        }
        // Garantir que complianceScore seja válido ou null
        if (parsed.complianceScore && (
          typeof parsed.complianceScore.min !== 'number' || 
          typeof parsed.complianceScore.max !== 'number' ||
          parsed.complianceScore.min < 0 ||
          parsed.complianceScore.max > 100 ||
          parsed.complianceScore.min > parsed.complianceScore.max
        )) {
          parsed.complianceScore = null;
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
    return {};
  }, []);

  return { saveFilters, loadFilters };
};

export const useFilters = (campaigns: Campaign[] = []) => {
  const { saveFilters, loadFilters } = useFilterPersistence();
  
  // Inicializar filtros com dados salvos
  const [filters, setFiltersState] = useState<FilterState>(() => {
    const savedFilters = loadFilters();
    return { ...DEFAULT_FILTER_STATE, ...savedFilters };
  });

  // Debounce para busca textual
  const debouncedSearch = useDebounce(filters.textSearch, 300);

  // Filtros com busca debounced
  const debouncedFilters = useMemo(() => ({
    ...filters,
    textSearch: debouncedSearch,
  }), [filters, debouncedSearch]);

  // Aplicar filtros às campanhas
  const filteredCampaigns = useMemo(() => {
    if (!isValidFilter(debouncedFilters)) {
      return campaigns;
    }
    return applyFilters(campaigns, debouncedFilters);
  }, [campaigns, debouncedFilters]);

  // Extrair opções de filtro
  const filterOptions = useMemo(() => {
    return extractFilterOptions(campaigns);
  }, [campaigns]);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    return countActiveFilters(filters);
  }, [filters]);

  // Verificar se há filtros ativos
  const hasActiveFilters = activeFiltersCount > 0;

  // Função para atualizar filtros
  const setFilters = useCallback((newFilters: Partial<FilterState> | ((prev: FilterState) => FilterState)) => {
    setFiltersState(prev => {
      const updated = typeof newFilters === 'function' ? newFilters(prev) : { ...prev, ...newFilters };
      
      // Validar filtros antes de aplicar
      if (isValidFilter(updated)) {
        saveFilters(updated);
        return updated;
      }
      
      return prev;
    });
  }, [saveFilters]);

  // Função para resetar filtros
  const resetFilters = useCallback(() => {
    const defaultFilters = DEFAULT_FILTER_STATE;
    setFiltersState(defaultFilters);
    saveFilters(defaultFilters);
  }, [saveFilters]);

  // Função para limpar um filtro específico
  const clearFilter = useCallback((filterKey: keyof FilterState) => {
    setFilters(prev => {
      const updated = { ...prev };
      
      switch (filterKey) {
        case 'textSearch':
          updated.textSearch = '';
          break;
        case 'dateRange':
          updated.dateRange = {};
          break;
        case 'complianceScore':
          updated.complianceScore = null;
          break;
        case 'colors':
        case 'styles':
        case 'budget':
        case 'occasion':
        case 'audience':
        case 'hasAdjustments':
          updated[filterKey] = [];
          break;
        case 'sort':
          updated.sort = { sortBy: 'created_at', direction: 'desc' };
          break;
        default:
          break;
      }
      
      return updated;
    });
  }, [setFilters]);

  // Funções específicas para cada filtro
  const setTextSearch = useCallback((value: string) => {
    setFilters({ textSearch: value });
  }, [setFilters]);

  const setDateRange = useCallback((dateRange: FilterState['dateRange']) => {
    setFilters({ dateRange });
  }, [setFilters]);

  const setComplianceScore = useCallback((complianceScore: FilterState['complianceScore']) => {
    setFilters({ complianceScore });
  }, [setFilters]);

  const setColors = useCallback((colors: string[]) => {
    setFilters({ colors });
  }, [setFilters]);

  const setStyles = useCallback((styles: string[]) => {
    setFilters({ styles });
  }, [setFilters]);

  const setBudget = useCallback((budget: string[]) => {
    setFilters({ budget });
  }, [setFilters]);

  const setOccasion = useCallback((occasion: string[]) => {
    setFilters({ occasion });
  }, [setFilters]);

  const setAudience = useCallback((audience: string[]) => {
    setFilters({ audience });
  }, [setFilters]);

  const setHasAdjustments = useCallback((hasAdjustments: string[]) => {
    setFilters({ hasAdjustments });
  }, [setFilters]);

  const setSort = useCallback((sort: FilterState['sort']) => {
    setFilters({ sort });
  }, [setFilters]);

  // Salvar filtros quando mudarem (exceto busca que é debounced)
  useEffect(() => {
    const filtersToSave = { ...filters };
    // Não salvar a busca imediatamente para evitar muitas escritas
    if (filters.textSearch !== debouncedSearch) {
      filtersToSave.textSearch = debouncedSearch;
    }
    saveFilters(filtersToSave);
  }, [filters, debouncedSearch, saveFilters]);

  return {
    filters,
    filteredCampaigns,
    filterOptions,
    activeFiltersCount,
    hasActiveFilters,
    
    // Funções de controle
    setFilters,
    resetFilters,
    clearFilter,
    
    // Funções específicas para cada filtro
    setTextSearch,
    setDateRange,
    setComplianceScore,
    setColors,
    setStyles,
    setBudget,
    setOccasion,
    setAudience,
    setHasAdjustments,
    setSort,
    
    isLoading: false, // Pode ser usado para estados de carregamento futuros
  };
};