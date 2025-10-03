export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  status: 'draft' | 'published' | 'scheduled';
  centerpiece_image: string;
  accessories_images: string[];
  model_image?: string;
  look_visual: string;
  image_analysis?: {
    mainPiece: string;
    colors: string;
    styleAesthetic: string;
    accessories: string;
  };
  short_description: string;
  long_description: string;
  instagram: {
    caption: string;
    hashtags: string[];
    callToAction: string;
    altText: string;
    suggestedTime: string;
  };
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  brand_compliance_score?: number;
  brand_compliance_adjustments?: string[];
}
