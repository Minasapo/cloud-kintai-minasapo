import MobileStepper from "@mui/material/MobileStepper";
import { AppButton } from "@shared/ui/button";

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type AppMobileStepperProps = {
  steps: number;
  activeStep: number;
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
};

export default function AppMobileStepper({
  steps,
  activeStep,
  onBack,
  onNext,
  backDisabled = false,
  nextDisabled = false,
  backLabel = "前へ",
  nextLabel = "次へ",
}: AppMobileStepperProps) {
  return (
    <MobileStepper
      variant="dots"
      steps={steps}
      position="static"
      activeStep={activeStep}
      sx={{ background: "transparent", padding: 0 }}
      backButton={
        <AppButton
          variant="outline"
          tone="secondary"
          size="sm"
          onClick={onBack}
          disabled={backDisabled}
          startIcon={<ChevronLeftIcon />}
          className="min-w-0"
        >
          {backLabel}
        </AppButton>
      }
      nextButton={
        <AppButton
          variant="outline"
          tone="secondary"
          size="sm"
          onClick={onNext}
          disabled={nextDisabled}
          endIcon={<ChevronRightIcon />}
          className="min-w-0"
        >
          {nextLabel}
        </AppButton>
      }
    />
  );
}
