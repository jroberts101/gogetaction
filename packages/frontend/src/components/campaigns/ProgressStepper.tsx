import React from 'react';

interface ProgressStepperProps {
  step: number;
  totalSteps: number;
  labels: string[];
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ step, totalSteps, labels }) => {
  return (
    <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                step >= index + 1 ? 'bg-campaign-accent text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 flex-1 ${step > index + 1 ? 'bg-campaign-accent' : 'bg-gray-200'}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm">
        {labels.map((label, index) => (
          <span
            key={index}
            className={step >= index + 1 ? 'text-campaign-accent font-medium' : 'text-gray-500'}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;
