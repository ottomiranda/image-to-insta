import React, { useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductRepositoryDialog from "./ProductRepositoryDialog";

interface ProductImage {
  src: string;
  name: string;
  alt: string;
  category: string;
}

interface ImageSelectorProps {
  label: string;
  value: File | string | null;
  onChange: (file: File | string) => void;
  required?: boolean;
  productCategories?: {
    dresses: ProductImage[];
    accessories: ProductImage[];
  };
  modelRepository?: { src: string; name: string; alt: string }[];
  repositoryTitle: string;
  showCategories?: boolean;
}

const ImageSelector = ({
  label,
  value,
  onChange,
  required = false,
  productCategories,
  modelRepository,
  repositoryTitle,
  showCategories = false,
}: ImageSelectorProps) => {
  const [showRepository, setShowRepository] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onChange(file);
    }
  };

  const handleRepositorySelect = (imageSrc: string) => {
    onChange(imageSrc);
    setShowRepository(false);
  };

  const getDisplayName = () => {
    if (selectedFile) return selectedFile.name;
    if (typeof value === "string") {
      // Check in product categories if available
      if (productCategories) {
        const allProducts = [...productCategories.dresses, ...productCategories.accessories];
        const selected = allProducts.find((img) => img.src === value);
        if (selected) return selected.name;
      }
      // Check in model repository if available
      if (modelRepository) {
        const selected = modelRepository.find((img) => img.src === value);
        if (selected) return selected.name;
      }
      return "Selected from repository";
    }
    if (value instanceof File) return value.name;
    return "Click to upload";
  };

  const getPreviewUrl = () => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    if (typeof value === "string") return value;
    if (value instanceof File) return URL.createObjectURL(value);
    return null;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className="space-y-2">
      <Label className="text-gray-300">
        {label} {required && "*"}
      </Label>

      <div className="grid grid-cols-2 gap-2">
        {/* Upload Button */}
        <div className="border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all cursor-pointer bg-secondary/30">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${label}`}
          />
          <label htmlFor={`upload-${label}`} className="flex flex-col items-center gap-2 cursor-pointer">
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 text-center">Upload</span>
          </label>
        </div>

        {/* Repository Button */}
        <div
          onClick={() => setShowRepository(true)}
          className="border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all cursor-pointer bg-secondary/30"
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 text-center">Repository</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mt-2 relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border border-white/10"
          />
          <div className="mt-1 text-xs text-gray-400 truncate">{getDisplayName()}</div>
        </div>
      )}

      {/* Repository Dialog - Conditional rendering based on type */}
      {showCategories && productCategories ? (
        <ProductRepositoryDialog
          open={showRepository}
          onOpenChange={setShowRepository}
          onSelect={handleRepositorySelect}
          dresses={productCategories.dresses}
          accessories={productCategories.accessories}
        />
      ) : (
        <Dialog open={showRepository} onOpenChange={setShowRepository}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-foreground">{repositoryTitle}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {modelRepository?.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleRepositorySelect(image.src)}
                  className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-white/10 hover:border-primary/60 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Select
                    </Button>
                  </div>
                  <div className="p-2 bg-card/90 backdrop-blur-sm">
                    <p className="text-xs text-foreground truncate">{image.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageSelector;
