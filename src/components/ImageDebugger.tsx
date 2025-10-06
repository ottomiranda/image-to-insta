import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { resolveRepositoryAsset, resolveRepositoryAssets } from "@/lib/assetResolver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ImageDebugger = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns-debug"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, centerpiece_image, accessories_images, model_image")
        .limit(3);

      if (error) throw error;
      return data as Campaign[];
    },
  });

  if (isLoading) return <div>Carregando campanhas para debug...</div>;

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>🐛 Debug de Imagens das Campanhas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns?.map((campaign) => (
          <div key={campaign.id} className="border p-4 rounded">
            <h3 className="font-bold mb-2">{campaign.title}</h3>
            
            <div className="space-y-2">
              <div>
                <strong>Centerpiece Image (Raw):</strong>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(campaign.centerpiece_image, null, 2)}
                </pre>
                <strong>Centerpiece Image (Resolved):</strong>
                <pre className="text-xs bg-blue-100 p-2 rounded mt-1">
                  {JSON.stringify(resolveRepositoryAsset(campaign.centerpiece_image), null, 2)}
                </pre>
                {resolveRepositoryAsset(campaign.centerpiece_image) && (
                  <img 
                    src={resolveRepositoryAsset(campaign.centerpiece_image)} 
                    alt="Centerpiece" 
                    className="w-32 h-32 object-cover border mt-2"
                  />
                )}
              </div>

              <div>
                <strong>Accessories Images (Raw):</strong>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                  {JSON.stringify(campaign.accessories_images, null, 2)}
                </pre>
                <strong>Accessories Images (Resolved):</strong>
                <pre className="text-xs bg-blue-100 p-2 rounded mt-1">
                  {JSON.stringify(resolveRepositoryAssets(campaign.accessories_images), null, 2)}
                </pre>
                <div className="flex gap-2 mt-2">
                  {resolveRepositoryAssets(campaign.accessories_images).map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`Accessory ${idx + 1}`} 
                      className="w-24 h-24 object-cover border"
                    />
                  ))}
                </div>
              </div>

              {campaign.model_image && (
                <div>
                  <strong>Model Image (Raw):</strong>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(campaign.model_image, null, 2)}
                  </pre>
                  <strong>Model Image (Resolved):</strong>
                  <pre className="text-xs bg-blue-100 p-2 rounded mt-1">
                    {JSON.stringify(resolveRepositoryAsset(campaign.model_image), null, 2)}
                  </pre>
                  {resolveRepositoryAsset(campaign.model_image) && (
                    <img 
                      src={resolveRepositoryAsset(campaign.model_image)} 
                      alt="Model" 
                      className="w-32 h-32 object-cover border mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};