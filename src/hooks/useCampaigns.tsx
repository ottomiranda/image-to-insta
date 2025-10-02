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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
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
