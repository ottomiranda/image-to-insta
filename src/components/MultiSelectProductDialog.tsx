import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export interface ProductImage {
  src: string;
  name: string;
  alt: string;
  category: string;
}

interface MultiSelectProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selection: {
    centerpiece: string | null;
    accessories: string[];
  }) => void;
  dresses: ProductImage[];
  accessories: ProductImage[];
  initialSelection?: {
    centerpiece: string | null;
    accessories: string[];
  };
}

export const MultiSelectProductDialog = ({
  open,
  onOpenChange,
  onConfirm,
  dresses,
  accessories,
  initialSelection,
}: MultiSelectProductDialogProps) => {
  const [selectedDress, setSelectedDress] = React.useState<string | null>(
    initialSelection?.centerpiece || null
  );
  const [selectedAccessories, setSelectedAccessories] = React.useState<string[]>(
    initialSelection?.accessories || []
  );

  const toggleAccessory = (src: string) => {
    setSelectedAccessories(prev =>
      prev.includes(src)
        ? prev.filter(item => item !== src)
        : [...prev, src]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      centerpiece: selectedDress,
      accessories: selectedAccessories,
    });
    onOpenChange(false);
  };

  const totalItems = (selectedDress ? 1 : 0) + selectedAccessories.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Select Products
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Choose 1 centerpiece dress and multiple accessories
          </p>
        </DialogHeader>

        <Tabs defaultValue="dresses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="dresses" className="data-[state=active]:bg-primary">
              Dresses {selectedDress && "✓"}
            </TabsTrigger>
            <TabsTrigger value="accessories" className="data-[state=active]:bg-primary">
              Accessories {selectedAccessories.length > 0 && `(${selectedAccessories.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dresses" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              {dresses.map((dress) => {
                const isSelected = selectedDress === dress.src;
                return (
                  <div
                    key={dress.src}
                    onClick={() => setSelectedDress(dress.src)}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? "border-primary shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={dress.src}
                      alt={dress.alt}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-2">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-lg">
                      <p className="text-white font-medium text-sm">{dress.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              {accessories.map((accessory) => {
                const isSelected = selectedAccessories.includes(accessory.src);
                return (
                  <div
                    key={accessory.src}
                    onClick={() => toggleAccessory(accessory.src)}
                    className={`relative cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${
                      isSelected
                        ? "border-accent shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={accessory.src}
                      alt={accessory.alt}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-accent rounded-full p-2">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-lg">
                      <p className="text-white font-medium text-sm">{accessory.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDress}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            Confirm Selection {totalItems > 0 && `(${totalItems} ${totalItems === 1 ? 'item' : 'items'})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
