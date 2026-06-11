// src/components/form/StepIndicator.stories.jsx
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { MemoryRouter } from "react-router-dom";
import StepIndicator from "../../components/form/StepIndicator";

library.add(faCheck);

export default {
  title: "Form/StepIndicator",
  component: StepIndicator,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    currentStep: {
      control: { type: "number", min: 1, max: 3 },
      description: "The currently active step (1–3)",
    },
  },
};

export const Step1 = {
  name: "Step 1 — Basic Info",
  args: { currentStep: 1 },
};

export const Step2 = {
  name: "Step 2 — Media",
  args: { currentStep: 2 },
};

export const Step3 = {
  name: "Step 3 — Assignment",
  args: { currentStep: 3 },
};

export const Completed = {
  name: "All steps done",
  args: { currentStep: 4 },
};
