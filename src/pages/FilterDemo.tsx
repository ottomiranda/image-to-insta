import React from "react";
import { CampaignFilters } from "@/components/filters/CampaignFilters";
import { mockCampaigns } from "@/lib/mockData";
import { Campaign } from "@/types/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FilterDemo() {
  const [filteredCampaigns, setFilteredCampaigns] = React.useState<Campaign[]>([]);

  const handleFiltersChange = (filtered: Campaign[]) => {
    setFilteredCampaigns(filtered);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sistema de Filtros - Demonstração</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <CampaignFilters
            campaigns={mockCampaigns}
            onFiltersChange={handleFiltersChange}
          />
        </div>
        
        {/* Resultados */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Campanhas Filtradas ({filteredCampaigns.length > 0 ? filteredCampaigns.length : mockCampaigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(filteredCampaigns.length > 0 ? filteredCampaigns : mockCampaigns).map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground">Status: {campaign.status}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {campaign.brand_compliance_score || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Criado em: {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {campaign.lookpost_schema && (
                      <div className="mt-2 text-xs">
                        <p><strong>Cores:</strong> {campaign.lookpost_schema.dominant_colors?.join(', ')}</p>
                        <p><strong>Estilo:</strong> {campaign.lookpost_schema.style_aesthetic?.join(', ')}</p>
                        <p><strong>Orçamento:</strong> {campaign.lookpost_schema.budget_category?.join(', ')}</p>
                        <p><strong>Ocasião:</strong> {campaign.lookpost_schema.occasion_event?.join(', ')}</p>
                        <p><strong>Público:</strong> {campaign.lookpost_schema.target_audience?.join(', ')}</p>
                        <p><strong>Ajustes:</strong> {campaign.lookpost_schema.brand_compliance_adjustments?.length || 0}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}