import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OnboardingWelcomeModalProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function OnboardingWelcomeModal({
  open,
  onStart,
  onSkip,
}: OnboardingWelcomeModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t("onboarding.welcome.title")}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {t("onboarding.welcome.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t("onboarding.welcome.duration")}
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onSkip} className="w-full sm:w-auto">
            {t("onboarding.welcome.skip")}
          </Button>
          <Button onClick={onStart} className="w-full sm:w-auto">
            {t("onboarding.welcome.start")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
