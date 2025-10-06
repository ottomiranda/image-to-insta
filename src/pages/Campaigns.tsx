import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter as FilterIcon, Plus, Search, X } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { PublishCampaignDialog } from "@/components/PublishCampaignDialog";
import { BrandSettingsDialog } from "@/components/BrandSettingsDialog";
import { UserNav } from "@/components/UserNav";
import { Campaign } from "@/types/campaign";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { BrandComplianceWidget } from "@/components/BrandComplianceWidget";
import { OnboardingTour } from "@/components/OnboardingTour";
import { CampaignCardSkeleton } from "@/components/CampaignCardSkeleton";
import { CampaignFilters } from "@/components/filters/CampaignFilters";
import { useFilters } from "@/hooks/useFilters";
import { mockCampaigns } from "@/lib/mockData";
import { FilterState, SORT_OPTIONS } from "@/types/filters";


function SortDropdown({
  sort,
  onSortChange,
}: {
  sort: FilterState['sort'];
  onSortChange: (sort: FilterState['sort']) => void;
}) {
  const { t } = useTranslation();

  const handleSortByChange = (value: string) => {
    onSortChange({
      sortBy: value as FilterState['sort']['sortBy'],
      direction: sort.direction,
    });
  };

  const handleDirectionChange = (value: string) => {
    onSortChange({
      ...sort,
      direction: value as FilterState['sort']['direction'],
    });
  };

  const applyQuickSort = (
    sortBy: FilterState['sort']['sortBy'],
    direction: FilterState['sort']['direction'],
  ) => {
    onSortChange({ sortBy, direction });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('filters.sort.label')}
        >
          <FilterIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 space-y-3">
        <div>
          <DropdownMenuLabel>{t('filters.sort.sortBy')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort.sortBy}
            onValueChange={handleSortByChange}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {t(option.label)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>
        <div>
          <DropdownMenuLabel>{t('filters.sort.direction')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort.direction}
            onValueChange={handleDirectionChange}
          >
            <DropdownMenuRadioItem value="asc">
              {t('filters.sort.ascending')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">
              {t('filters.sort.descending')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </div>
        <DropdownMenuSeparator />
        <div className="space-y-1">
          <DropdownMenuLabel>{t('filters.sort.quickSort')}</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => applyQuickSort('created_at', 'desc')}
          >
            {t('filters.sort.newest')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => applyQuickSort('created_at', 'asc')}
          >
            {t('filters.sort.oldest')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => applyQuickSort('brand_compliance_score', 'desc')}
          >
            {t('filters.sort.bestScore')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => applyQuickSort('title', 'asc')}
          >
            {t('filters.sort.alphabetical')}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Campaigns() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { campaigns: realCampaigns, isLoading, error, deleteCampaign, updateCampaign } = useCampaigns();
  
  // Use mock data for development/testing
  const campaigns = realCampaigns && realCampaigns.length > 0 ? realCampaigns : mockCampaigns;
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Apply status filter to campaigns
  const statusFilteredCampaigns = useMemo(() => 
    campaigns?.filter((c) => statusFilter === "all" ? true : c.status === statusFilter) || [],
    [campaigns, statusFilter]
  );

  // Use the filters hook with status-filtered campaigns
  const {
    filteredCampaigns,
    filterOptions,
    activeFiltersCount,
    hasActiveFilters,
    resetFilters,
    clearFilter,
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
    filters
  } = useFilters(statusFilteredCampaigns);

  // Lazy loading state
  const [displayLimit, setDisplayLimit] = useState(9);
  const displayedCampaigns = useMemo(() => 
    filteredCampaigns?.slice(0, displayLimit),
    [filteredCampaigns, displayLimit]
  );
  
  const hasMore = filteredCampaigns && filteredCampaigns.length > displayLimit;

  const handlePublish = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPublishDialogOpen(true);
  };

  const handlePublishConfirm = async (publishType: "now" | "schedule", scheduledDate?: Date) => {
    if (!selectedCampaign) return;

    const updateData: Partial<Campaign> = {
      status: publishType === "now" ? "published" : "scheduled",
    };

    if (publishType === "now") {
      updateData.published_at = new Date().toISOString();
    } else if (scheduledDate) {
      updateData.scheduled_at = scheduledDate.toISOString();
    }

    await updateCampaign({ id: selectedCampaign.id, data: updateData });
    setSelectedCampaign(null);
  };



  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Logo size="large" onClick={() => navigate('/campaigns')} />
            </div>
            <p className="text-sm text-muted-foreground">{t('campaigns.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create")} data-onboarding="new-campaign-btn">
              <Plus className="h-4 w-4 mr-2" />
              {t('campaigns.newCampaign')}
            </Button>
            <div data-onboarding="user-nav">
              <UserNav onSettingsClick={() => setSettingsOpen(true)} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Brand Compliance Widget */}
        <div className="mb-8" data-onboarding="compliance-widget">
          <BrandComplianceWidget campaigns={campaigns} isLoading={isLoading} />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-80 lg:flex-shrink-0">
            <CampaignFilters
              filters={filters}
              filterOptions={filterOptions}
              activeFiltersCount={activeFiltersCount}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              onClearFilter={clearFilter}
              onDateRangeChange={setDateRange}
              onComplianceScoreChange={setComplianceScore}
              onColorsChange={setColors}
              onStylesChange={setStyles}
              onBudgetChange={setBudget}
              onOccasionChange={setOccasion}
              onAudienceChange={setAudience}
              onHasAdjustmentsChange={setHasAdjustments}
              className="lg:sticky top-24"
            />
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
              <div className="relative w-full md:max-w-xs lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={filters.textSearch}
                  onChange={(event) => setTextSearch(event.target.value)}
                  placeholder={t('filters.search.placeholder')}
                  aria-label={t('filters.search.label')}
                  className="pl-10 pr-10"
                />
                {filters.textSearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={t('filters.clear')}
                    onClick={() => setTextSearch('')}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="md:self-end"
              >
                <TabsList className="grid grid-cols-2 gap-2 md:flex md:gap-0">
                  <TabsTrigger value="all">{t('campaigns.all')}</TabsTrigger>
                  <TabsTrigger value="draft">{t('campaigns.draft')}</TabsTrigger>
                  <TabsTrigger value="published">{t('campaigns.published')}</TabsTrigger>
                  <TabsTrigger value="scheduled">{t('campaigns.scheduled')}</TabsTrigger>
                </TabsList>
              </Tabs>

              <SortDropdown sort={filters.sort} onSortChange={setSort} />
            </div>

            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <CampaignCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">
                    {t('campaigns.errorLoading') || 'Error loading campaigns. Please try again.'}
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    {t('common.retry') || 'Retry'}
                  </Button>
                </div>
              ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedCampaigns?.map((campaign, index) => (
                      <div key={campaign.id} data-onboarding={index === 0 ? "campaign-card" : undefined}>
                        <CampaignCard
                          campaign={campaign}
                          onDelete={deleteCampaign}
                          onPublish={handlePublish}
                        />
                      </div>
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setDisplayLimit((prev) => prev + 9)}
                      >
                        {t('campaigns.loadMore') || 'Carregar mais'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {statusFilter === "all"
                      ? t('campaigns.noCampaignsDesc')
                      : t('campaigns.noCampaigns')}
                  </p>
                  <Button onClick={() => navigate("/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('campaigns.newCampaign')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublishCampaignDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onPublish={handlePublishConfirm}
      />

      <BrandSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
