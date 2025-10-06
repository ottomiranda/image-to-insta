// Mock data for testing the filter system
import { Campaign } from "@/types/campaign";

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    user_id: "user1",
    title: "Campanha Verão Elegante",
    prompt: "Look elegante para o verão com vestido vermelho e acessórios dourados",
    status: "published",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    published_at: "2024-01-16T14:00:00Z",
    brand_compliance_score: 92,
    centerpiece_image: "vestido1.jpg",
    accessories_images: ["acessorio1.jpg", "acessorio2.jpg"],
    model_image: "modelo1.jpg",
    look_visual: "https://example.com/look1.jpg",
    short_description: "Look elegante para o verão",
    long_description: "Um look sofisticado e elegante perfeito para ocasiões especiais no verão.",
    instagram: {
      caption: "Look elegante para o verão ✨ #verao #elegante #moda",
      hashtags: ["#verao", "#elegante", "#moda", "#estilo"],
      callToAction: "Confira mais looks no nosso site!",
      altText: "Mulher usando vestido vermelho elegante com acessórios dourados",
      suggestedTime: "18:00"
    },
    lookpost_schema: {
      prompt: "Look elegante para o verão com vestido vermelho e acessórios dourados",
      dominant_colors: ["vermelho", "dourado", "branco"],
      style_aesthetic: ["elegante", "sofisticado", "verão"],
      budget_category: ["premium", "luxo"],
      occasion_event: ["festa", "evento social"],
      target_audience: ["mulheres 25-40", "profissionais"],
      brand_compliance_adjustments: ["Ajustado tom de voz para mais elegante", "Removido superlativo excessivo"]
    }
  },
  {
    id: "2",
    user_id: "user1",
    title: "Look Casual Primavera",
    status: "draft",
    created_at: "2024-01-20T09:30:00Z",
    brand_compliance_score: 78,
    lookpost_schema: {
      prompt: "Look casual e confortável para o dia a dia na primavera",
      dominant_colors: ["azul", "branco", "bege"],
      style_aesthetic: ["casual", "confortável", "minimalista"],
      budget_category: ["médio", "acessível"],
      occasion_event: ["dia a dia", "trabalho"],
      target_audience: ["mulheres jovens", "estudantes"],
      brand_compliance_adjustments: ["Incluído call-to-action", "Ajustado hashtags da marca"]
    }
  },
  {
    id: "3",
    user_id: "user1",
    title: "Noite Glamourosa",
    status: "scheduled",
    created_at: "2024-01-25T16:45:00Z",
    scheduled_at: "2024-02-01T20:00:00Z",
    brand_compliance_score: 95,
    lookpost_schema: {
      prompt: "Look glamouroso para eventos noturnos especiais",
      dominant_colors: ["preto", "prata", "dourado"],
      style_aesthetic: ["glamouroso", "sofisticado", "noturno"],
      budget_category: ["premium", "luxo"],
      occasion_event: ["festa", "gala", "evento especial"],
      target_audience: ["mulheres 30-50", "executivas"],
      brand_compliance_adjustments: []
    }
  },
  {
    id: "4",
    user_id: "user1",
    title: "Estilo Boho Chic",
    status: "published",
    created_at: "2024-01-10T11:20:00Z",
    published_at: "2024-01-12T15:30:00Z",
    brand_compliance_score: 65,
    lookpost_schema: {
      prompt: "Look boho chic com elementos naturais e cores terrosas",
      dominant_colors: ["marrom", "bege", "verde"],
      style_aesthetic: ["boho", "natural", "descontraído"],
      budget_category: ["médio", "sustentável"],
      occasion_event: ["festival", "passeio"],
      target_audience: ["mulheres jovens", "artistas"],
      brand_compliance_adjustments: ["Melhorado alinhamento com valores da marca", "Ajustado linguagem", "Incluído menção sustentabilidade"]
    }
  },
  {
    id: "5",
    user_id: "user1",
    title: "Business Professional",
    status: "draft",
    created_at: "2024-01-28T08:15:00Z",
    brand_compliance_score: 88,
    lookpost_schema: {
      prompt: "Look profissional para ambiente corporativo",
      dominant_colors: ["azul marinho", "branco", "cinza"],
      style_aesthetic: ["profissional", "clássico", "conservador"],
      budget_category: ["premium", "corporativo"],
      occasion_event: ["trabalho", "reunião", "apresentação"],
      target_audience: ["executivas", "profissionais"],
      brand_compliance_adjustments: ["Ajustado tom profissional"]
    }
  }
];

// Helper function to get filter options from campaigns
export const getFilterOptionsFromCampaigns = (campaigns: Campaign[]) => {
  const colors = new Set<string>();
  const styles = new Set<string>();
  const budget = new Set<string>();
  const occasion = new Set<string>();
  const audience = new Set<string>();

  campaigns.forEach(campaign => {
    if (campaign.lookpost_schema) {
      campaign.lookpost_schema.dominant_colors?.forEach(color => colors.add(color));
      campaign.lookpost_schema.style_aesthetic?.forEach(style => styles.add(style));
      campaign.lookpost_schema.budget_category?.forEach(cat => budget.add(cat));
      campaign.lookpost_schema.occasion_event?.forEach(occ => occasion.add(occ));
      campaign.lookpost_schema.target_audience?.forEach(aud => audience.add(aud));
    }
  });

  return {
    colors: Array.from(colors).map(color => ({ value: color, label: color, count: 0 })),
    styles: Array.from(styles).map(style => ({ value: style, label: style, count: 0 })),
    budget: Array.from(budget).map(cat => ({ value: cat, label: cat, count: 0 })),
    occasion: Array.from(occasion).map(occ => ({ value: occ, label: occ, count: 0 })),
    audience: Array.from(audience).map(aud => ({ value: aud, label: aud, count: 0 })),
    hasAdjustments: [
      { value: 'with', label: 'Com ajustes', count: 0 },
      { value: 'without', label: 'Sem ajustes', count: 0 }
    ]
  };
};