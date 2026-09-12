import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./StepIndicator.css";

const STEPS = [
  { number: 1, label: "Acquisition Info", icon: "fa-solid fa-file-lines" },
  { number: 2, label: "Items", icon: "fa-solid fa-boxes-stacked" },
  { number: 3, label: "Review & Submit", icon: "fa-solid fa-clipboard-check" },
];
function StepIndicator({ currentStep }) {
  return (
    <div className="reg-steps">
      {STEPS.map((step, i) => {
        const isDone = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            {i > 0 && (
              <div
                className={`reg-step-line ${isDone ? "reg-step-line--done" : ""}`}
              />
            )}

            <div className="reg-step-item">
              <div
                className={`reg-step-circle
                  ${isActive ? "reg-step-circle--active" : ""}
                  ${isDone ? "reg-step-circle--done" : ""}
                `}
              >
                {isDone ? (
                  <FontAwesomeIcon icon="fa-solid fa-check" />
                ) : (
                  <FontAwesomeIcon icon={step.icon} />
                )}
              </div>
              <span
                className={`reg-step-label
                  ${isActive ? "reg-step-label--active" : ""}
                  ${isDone ? "reg-step-label--done" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepIndicator;
