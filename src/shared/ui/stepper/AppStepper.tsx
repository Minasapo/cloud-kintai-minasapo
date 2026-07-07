import { Step, StepLabel, Stepper } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type AppStepperStep = {
  key: string;
  label: string;
};

type AppStepperProps = {
  steps: readonly AppStepperStep[];
  activeStep: number;
  completedSteps?: readonly number[];
  className?: string;
  sx?: SxProps<Theme>;
};

export default function AppStepper({
  steps,
  activeStep,
  completedSteps,
  className,
  sx,
}: AppStepperProps) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      className={className}
      sx={sx}
    >
      {steps.map((step, index) => (
        <Step
          key={step.key}
          completed={
            completedSteps ? completedSteps.includes(index) : undefined
          }
        >
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
