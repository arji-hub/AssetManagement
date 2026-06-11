import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./StepIndicator.css";

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Media" },
  { number: 3, label: "Assignment" },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="reg-steps">
      {STEPS.map((step, i) => {
        const isDone = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            {/* connector line before every step except the first */}
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
                  step.number
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
