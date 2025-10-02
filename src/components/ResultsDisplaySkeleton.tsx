import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, FileText, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

const ResultsDisplaySkeleton = () => {
  const { t } = useTranslation();

  return (
    <div 
      className="space-y-6 animate-fade-in" 
      role="status" 
      aria-live="polite"
      aria-label={t('create.generatingContent')}
    >
      {/* Header com título e botão Export */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Card 1: Look Visual (imagem) */}
      <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-white/10">
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="p-4 bg-black/20">
          <Skeleton className="w-full aspect-[3/4] rounded-lg" />
        </div>
      </Card>

      {/* Card 2: Descrições do Produto */}
      <Card className="p-6 space-y-4 bg-card/80 backdrop-blur-sm border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <Skeleton className="h-5 w-40" />
        </div>
        
        {/* Short Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-16 w-full rounded-md" />
        </div>

        {/* Long Description */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </Card>

      {/* Card 3: Instagram Post */}
      <Card className="p-6 space-y-4 bg-card/80 backdrop-blur-sm border-white/10">
        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-accent" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* Alt Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>

        {/* Suggested Time */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-32" />
        </div>
      </Card>
    </div>
  );
};

export default ResultsDisplaySkeleton;
