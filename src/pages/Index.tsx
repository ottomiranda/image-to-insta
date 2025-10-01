import { useState } from "react";
import { Sparkles } from "lucide-react";
import InputForm from "@/components/InputForm";
import ResultsDisplay from "@/components/ResultsDisplay";

export interface GeneratedContent {
  lookVisual: string;
  shortDescription: string;
  longDescription: string;
  instagram: {
    caption: string;
    hashtags: string[];
    callToAction: string;
    altText: string;
    suggestedTime: string;
  };
}

const Index = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Do Look ao Post
              </h1>
              <p className="text-sm text-muted-foreground">Pipeline de marketing de moda com IA</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <InputForm 
            onGenerate={setGeneratedContent}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
          {generatedContent && (
            <ResultsDisplay content={generatedContent} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
