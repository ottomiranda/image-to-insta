import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Image as ImageIcon, FileText, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedContent } from "@/pages/Create";
import { useTranslation } from "react-i18next";
import { BrandComplianceIndicator } from "./BrandComplianceIndicator";
import { Campaign } from "@/types/campaign";
import { downloadCampaignJson } from "@/lib/lookpost";

interface ResultsDisplayProps {
  content: GeneratedContent;
}

const ResultsDisplay = ({ content }: ResultsDisplayProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('results.copied'),
      description: t('results.copiedDesc', { label }),
    });
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = content.lookVisual;
    link.download = 'generated-look.png';
    link.click();
    toast({
      title: t('results.downloadStarted'),
      description: t('results.downloadStartedDesc'),
    });
  };

  const exportJSON = () => {
    try {
      // Converter GeneratedContent para Campaign format parcial
      const campaignData: Partial<Campaign> = {
        id: crypto.randomUUID(),
        user_id: '',
        title: 'Generated Campaign',
        prompt: '',
        status: 'draft',
        centerpiece_image: '',
        accessories_images: [],
        look_visual: content.lookVisual,
        short_description: content.shortDescription,
        long_description: content.longDescription,
        instagram: {
          caption: content.instagram.caption,
          hashtags: content.instagram.hashtags,
          callToAction: content.instagram.callToAction,
          altText: content.instagram.altText,
          suggestedTime: content.instagram.suggestedTime,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        brand_compliance_score: content.brandComplianceScore,
        brand_compliance_adjustments: content.brandComplianceAdjustments,
      };
      
      downloadCampaignJson(campaignData as Campaign);
      
      toast({
        title: t('results.jsonExported'),
        description: t('results.jsonExportedDesc'),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: t('lookpost.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Compliance Score */}
      {content.brandComplianceScore !== undefined && (
        <Card className="bg-card/50 backdrop-blur border-white/5">
          <CardContent className="pt-6">
            <BrandComplianceIndicator
              score={content.brandComplianceScore}
              adjustments={content.brandComplianceAdjustments}
              showDetails={true}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('results.title')}</h2>
        <Button onClick={exportJSON} variant="outline" size="sm" className="border-white/20 hover:bg-white/5">
          <Download className="mr-2 h-4 w-4" />
          {t('results.exportJSON')}
        </Button>
      </div>

      {/* Look Visual */}
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-white/10 shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">{t('results.lookVisual')}</h3>
          </div>
          <Button onClick={downloadImage} variant="ghost" size="sm" className="hover:bg-white/10">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 bg-black/20">
          <img 
            src={content.lookVisual} 
            alt="Generated look"
            className="w-full rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
          />
        </div>
      </Card>

      {/* Product Descriptions */}
      <Card className="p-6 space-y-4 bg-card/80 backdrop-blur-sm border-white/10 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-white">{t('results.productDescriptions')}</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="border-white/20 bg-secondary/50 text-gray-300">{t('results.short')}</Badge>
              <Button
                onClick={() => copyToClipboard(content.shortDescription, "Short description")}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-black/40 p-3 rounded-md border border-white/10 text-gray-200">{content.shortDescription}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="border-white/20 bg-secondary/50 text-gray-300">{t('results.long')}</Badge>
              <Button
                onClick={() => copyToClipboard(content.longDescription, "Long description")}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-black/40 p-3 rounded-md border border-white/10 text-gray-200">{content.longDescription}</p>
          </div>
        </div>
      </Card>

      {/* Instagram Post */}
      <Card className="p-6 space-y-4 bg-card/80 backdrop-blur-sm border-white/10 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-white">{t('results.instagramPost')}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{t('results.caption')}</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.caption, "Caption")}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-black/40 p-3 rounded-md border border-white/10 text-gray-200 whitespace-pre-wrap">
              {content.instagram.caption}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{t('results.hashtags')}</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.hashtags.join(' '), "Hashtags")}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {content.instagram.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-primary/50 text-primary bg-primary/10">{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{t('results.callToAction')}</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.callToAction, "CTA")}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-black/40 p-3 rounded-md border border-white/10 text-gray-200">{content.instagram.callToAction}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{t('results.altText')}</span>
              <Button
                onClick={() => copyToClipboard(content.instagram.altText, "Alt text")}
                variant="ghost"
                size="sm"
                className="hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm bg-black/40 p-3 rounded-md border border-white/10 text-gray-200">{content.instagram.altText}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-300">{t('results.suggestedTime')}</span>
            <p className="text-lg font-semibold text-primary mt-1">{content.instagram.suggestedTime}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
