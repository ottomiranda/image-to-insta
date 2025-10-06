import { resolveRepositoryAsset, resolveRepositoryAssets } from "@/lib/assetResolver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ImageTestComponent = () => {
  // Teste com diferentes formatos de path que podem estar no banco
  const testPaths = [
    "red-boho-dress.jpg",
    "gold-necklace.jpg", 
    "sunglasses.jpg",
    "model-1.jpg",
    "assets/repository/products/dresses/red-boho-dress.jpg",
    "src/assets/repository/products/accessories/gold-necklace.jpg",
    "./assets/repository/models/model-1.jpg",
    "/assets/repository/products/accessories/sunglasses.jpg"
  ];

  const testArrayPaths = ["gold-necklace.jpg", "sunglasses.jpg"];

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>🧪 Teste de Resolução de Imagens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold mb-2">Teste de Paths Individuais:</h3>
          {testPaths.map((path, idx) => {
            const resolved = resolveRepositoryAsset(path);
            return (
              <div key={idx} className="border p-2 rounded mb-2">
                <div className="text-sm">
                  <strong>Input:</strong> <code>{path}</code>
                </div>
                <div className="text-sm">
                  <strong>Resolved:</strong> <code>{resolved || "null"}</code>
                </div>
                {resolved && (
                  <img 
                    src={resolved} 
                    alt={`Test ${idx}`} 
                    className="w-24 h-24 object-cover border mt-2"
                    onError={(e) => {
                      console.error(`❌ Erro ao carregar imagem: ${resolved}`);
                      e.currentTarget.style.border = "2px solid red";
                    }}
                    onLoad={() => {
                      console.log(`✅ Imagem carregada com sucesso: ${resolved}`);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="font-bold mb-2">Teste de Array de Paths:</h3>
          <div className="border p-2 rounded">
            <div className="text-sm">
              <strong>Input:</strong> <code>{JSON.stringify(testArrayPaths)}</code>
            </div>
            <div className="text-sm">
              <strong>Resolved:</strong> <code>{JSON.stringify(resolveRepositoryAssets(testArrayPaths))}</code>
            </div>
            <div className="flex gap-2 mt-2">
              {resolveRepositoryAssets(testArrayPaths).map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`Array Test ${idx}`} 
                  className="w-24 h-24 object-cover border"
                  onError={(e) => {
                    console.error(`❌ Erro ao carregar imagem do array: ${img}`);
                    e.currentTarget.style.border = "2px solid red";
                  }}
                  onLoad={() => {
                    console.log(`✅ Imagem do array carregada: ${img}`);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};