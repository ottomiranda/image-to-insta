import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { toast } from "@/hooks/use-toast";

export function useCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map((c: any) => ({
        ...c,
        accessories_images: c.accessories_images || [],
      })) as Campaign[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (campaign: Omit<Campaign, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          ...campaign,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Save brand validation data if available
      if (campaign.brand_compliance_score !== null && campaign.brand_compliance_score !== undefined) {
        const validationError = await supabase
          .from("brand_validations")
          .insert({
            user_id: user.id,
            campaign_id: data.id,
            original_content: {
              short_description: campaign.short_description,
              long_description: campaign.long_description,
              instagram: campaign.instagram,
            },
            corrected_content: {
              short_description: campaign.short_description,
              long_description: campaign.long_description,
              instagram: campaign.instagram,
            },
            validation_score: campaign.brand_compliance_score,
            adjustments_made: campaign.brand_compliance_adjustments || [],
            user_approved: null,
          })
          .select()
          .single();

        if (validationError.error) {
          console.error("Error saving brand validation:", validationError.error);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["brand-validations"] });
      queryClient.invalidateQueries({ queryKey: ["brand-validations-analytics"] });
      toast({
        title: "Campaign saved",
        description: "Your campaign has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Campaign> }) => {
      const { error } = await supabase
        .from("campaigns")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campaign updated",
        description: "Your campaign has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "Your campaign has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    campaigns,
    isLoading,
    saveCampaign: saveMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
  };
}
