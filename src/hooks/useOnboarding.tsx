import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStatus {
  id?: string;
  tutorial_completed: boolean;
  tutorial_skipped: boolean;
  current_step: number;
  completed_at?: string;
  updated_at?: string;
}

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus>({
    tutorial_completed: false,
    tutorial_skipped: false,
    current_step: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [run, setRun] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error loading onboarding:", error);
        return;
      }

      if (data) {
        setStatus(data);
        // Check if 24 hours have passed since last completion
        if (data.completed_at) {
          const lastCompleted = new Date(data.completed_at);
          const hoursSinceCompletion = (Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60);
          if (hoursSinceCompletion >= 24) {
            // Reset to show onboarding again
            const { data: resetData } = await supabase
              .from("user_onboarding")
              .update({
                tutorial_completed: false,
                tutorial_skipped: false,
                current_step: 0,
                updated_at: new Date().toISOString(),
              })
              .eq("id", data.id)
              .select()
              .single();
            
            if (resetData) {
              setStatus(resetData);
              setRun(true);
            }
          }
        }
      } else {
        // First time user - create record
        const { data: newStatus, error: insertError } = await supabase
          .from("user_onboarding")
          .insert({
            user_id: user.id,
            tutorial_completed: false,
            tutorial_skipped: false,
            current_step: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating onboarding:", insertError);
        } else if (newStatus) {
          setStatus(newStatus);
          // Auto-start for new users
          setRun(true);
        }
      }
    } catch (error) {
      console.error("Error in loadOnboardingStatus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTour = () => {
    setRun(true);
  };

  const skipTour = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !status.id) return;

      await supabase
        .from("user_onboarding")
        .update({
          tutorial_skipped: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", status.id);

      setStatus({ ...status, tutorial_skipped: true });
      setRun(false);
    } catch (error) {
      console.error("Error skipping tour:", error);
    }
  };

  const completeTour = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !status.id) return;

      await supabase
        .from("user_onboarding")
        .update({
          tutorial_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", status.id);

      setStatus({ ...status, tutorial_completed: true });
      setRun(false);

      toast({
        title: "🎉 Tutorial Completed!",
        description: "You're all set to create amazing campaigns!",
      });
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  };

  const updateStep = async (step: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !status.id) return;

      await supabase
        .from("user_onboarding")
        .update({
          current_step: step,
          updated_at: new Date().toISOString(),
        })
        .eq("id", status.id);

      setStatus({ ...status, current_step: step });
    } catch (error) {
      console.error("Error updating step:", error);
    }
  };

  const restartTour = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !status.id) return;

      await supabase
        .from("user_onboarding")
        .update({
          tutorial_completed: false,
          tutorial_skipped: false,
          current_step: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", status.id);

      setStatus({
        ...status,
        tutorial_completed: false,
        tutorial_skipped: false,
        current_step: 0,
      });
      setRun(true);
    } catch (error) {
      console.error("Error restarting tour:", error);
    }
  };

  return {
    status,
    isLoading,
    run,
    setRun,
    startTour,
    skipTour,
    completeTour,
    updateStep,
    restartTour,
    shouldShowTour: !status.tutorial_completed && !status.tutorial_skipped,
  };
}
