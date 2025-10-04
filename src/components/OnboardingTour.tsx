import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Joyride, { Step, CallBackProps, STATUS, ACTIONS, EVENTS } from "react-joyride";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingWelcomeModal } from "./OnboardingWelcomeModal";

export function OnboardingTour() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    run,
    setRun,
    skipTour,
    completeTour,
    updateStep,
    status,
    shouldShowTour,
  } = useOnboarding();
  const [showWelcome, setShowWelcome] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Show welcome modal for new users when they land on /campaigns
    if (shouldShowTour && location.pathname === "/campaigns") {
      setShowWelcome(true);
    }
  }, [shouldShowTour, location.pathname]);

  const steps: Step[] = [
    // Step 0: Dashboard
    {
      target: "body",
      content: t("onboarding.steps.dashboard.content"),
      title: t("onboarding.steps.dashboard.title"),
      placement: "center",
      disableBeacon: true,
    },
    // Step 1: Brand Compliance Widget
    {
      target: "[data-onboarding='compliance-widget']",
      content: t("onboarding.steps.compliance.content"),
      title: t("onboarding.steps.compliance.title"),
      placement: "bottom",
    },
    // Step 2: Campaign Card
    {
      target: "[data-onboarding='campaign-card']",
      content: t("onboarding.steps.campaignCard.content"),
      title: t("onboarding.steps.campaignCard.title"),
      placement: "right",
    },
    // Step 3: New Campaign Button
    {
      target: "[data-onboarding='new-campaign-btn']",
      content: t("onboarding.steps.newCampaign.content"),
      title: t("onboarding.steps.newCampaign.title"),
      placement: "bottom",
    },
    // Step 4: Create Form (navigate to /create)
    {
      target: "[data-onboarding='create-form']",
      content: t("onboarding.steps.createForm.content"),
      title: t("onboarding.steps.createForm.title"),
      placement: "right",
    },
    // Step 5: Brand Settings
    {
      target: "[data-onboarding='user-nav']",
      content: t("onboarding.steps.brandSettings.content"),
      title: t("onboarding.steps.brandSettings.title"),
      placement: "bottom",
    },
    // Step 6: Generate Button
    {
      target: "[data-onboarding='generate-btn']",
      content: t("onboarding.steps.generate.content"),
      title: t("onboarding.steps.generate.title"),
      placement: "top",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      if (status === STATUS.FINISHED) {
        completeTour();
      } else if (status === STATUS.SKIPPED) {
        skipTour();
      }
      setRun(false);
      // Navigate back to campaigns if not there
      if (location.pathname !== "/campaigns") {
        navigate("/campaigns");
      }
    } else if (type === EVENTS.STEP_AFTER) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextStepIndex);
      updateStep(nextStepIndex);

      // Navigate to /create when reaching step 4
      if (nextStepIndex === 4 && location.pathname !== "/create") {
        setTimeout(() => {
          navigate("/create");
        }, 300);
      }
      // Navigate back to /campaigns when going back from step 4
      if (index === 4 && action === ACTIONS.PREV && location.pathname !== "/campaigns") {
        setTimeout(() => {
          navigate("/campaigns");
        }, 300);
      }
    }
  };

  const handleWelcomeStart = () => {
    setShowWelcome(false);
    setRun(true);
  };

  const handleWelcomeSkip = () => {
    setShowWelcome(false);
    skipTour();
  };

  return (
    <>
      <OnboardingWelcomeModal
        open={showWelcome}
        onStart={handleWelcomeStart}
        onSkip={handleWelcomeSkip}
      />
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "hsl(var(--primary))",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 8,
          },
          buttonNext: {
            backgroundColor: "hsl(var(--primary))",
            borderRadius: 6,
          },
          buttonBack: {
            color: "hsl(var(--muted-foreground))",
          },
        }}
        locale={{
          back: t("common.back"),
          close: t("common.close"),
          last: t("onboarding.finish"),
          next: t("common.next"),
          skip: t("onboarding.skip"),
        }}
      />
    </>
  );
}
