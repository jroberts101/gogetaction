import React from 'react';
import RecipientSelector from './RecipientSelector';
import { Recipient } from '@/types';

interface RecipientsStepProps {
  selectedRecipients: Recipient[];
  setSelectedRecipients: React.Dispatch<React.SetStateAction<Recipient[]>>;
}

const RecipientsStep: React.FC<RecipientsStepProps> = ({
  selectedRecipients,
  setSelectedRecipients,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-campaign-text">Select Recipients</h2>
      <p className="text-campaign-muted mb-6">
        Choose one or more recipients who will receive the letters from your supporters.
      </p>

      <RecipientSelector
        selectedRecipients={selectedRecipients}
        onSelectRecipients={setSelectedRecipients}
      />
    </div>
  );
};

export default RecipientsStep;
