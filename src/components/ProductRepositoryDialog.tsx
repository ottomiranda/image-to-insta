import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductImage {
  src: string;
  name: string;
  alt: string;
  category: string;
}

interface ProductRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageSrc: string) => void;
  dresses: ProductImage[];
  accessories: ProductImage[];
}

const ProductRepositoryDialog = ({
  open,
  onOpenChange,
  onSelect,
  dresses,
  accessories,
}: ProductRepositoryDialogProps) => {
  const handleSelect = (imageSrc: string) => {
    onSelect(imageSrc);
    onOpenChange(false);
  };

  const renderProductGrid = (products: ProductImage[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <div
          key={index}
          onClick={() => handleSelect(product.src)}
          className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-white/10 hover:border-primary/60 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          <div className="bg-white p-4">
            <img
              src={product.src}
              alt={product.alt}
              className="w-full h-64 object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm">
              Select
            </Button>
          </div>
          <div className="p-3 bg-card/90 backdrop-blur-sm border-t border-white/10">
            <p className="text-sm text-foreground font-medium truncate">{product.name}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {product.category}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden bg-card/95 border-white/10 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Product Repository</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dresses" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 bg-muted/50">
            <TabsTrigger 
              value="dresses"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Dresses ({dresses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="accessories"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Accessories ({accessories.length})
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)] pr-2">
            <TabsContent value="dresses" className="mt-0">
              {renderProductGrid(dresses)}
            </TabsContent>

            <TabsContent value="accessories" className="mt-0">
              {renderProductGrid(accessories)}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductRepositoryDialog;
