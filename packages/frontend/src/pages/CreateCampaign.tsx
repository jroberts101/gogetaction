import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import ProgressStepper from '@/components/campaigns/ProgressStepper';
import CampaignDetailsForm from '@/components/campaigns/CampaignDetailsForm';
import LetterTemplatesStep from '@/components/campaigns/LetterTemplatesStep';
import RecipientsStep from '@/components/campaigns/RecipientsStep';
import { Recipient } from '@/types';
import { CampaignFormData, LetterTemplate } from '@/types/campaign';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplate[]>([
    {
      id: '1',
      title: 'Default Template',
      content: 'I am writing to...',
    },
  ]);

  const form = useForm<CampaignFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      goal: 100,
    },
  });

  const nextStep = () => {
    if (step === 1) {
      form.trigger(['title', 'description', 'category']);
      const hasErrors =
        !!form.formState.errors.title ||
        !!form.formState.errors.description ||
        !!form.formState.errors.category;

      if (!hasErrors) {
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = (data: CampaignFormData) => {
    if (letterTemplates.length === 0) {
      toast.error('Please add at least one letter template');
      return;
    }

    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    // Here you would typically save the campaign data
    console.log({
      ...data,
      letterTemplates,
      recipients: selectedRecipients,
    });

    toast.success('Campaign created successfully!');
    navigate('/campaigns');
  };

  const stepLabels = ['Campaign Details', 'Letter Templates', 'Recipients'];

  return (
    <>
      <Helmet>
        <title>Create a Campaign | GoGetAction</title>
        <meta
          name="description"
          content="Create an impactful advocacy campaign and mobilize supporters to send powerful letters to decision-makers."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-campaign-text mb-2">Create Your Campaign</h1>
            <p className="text-campaign-muted">
              Start making an impact by creating your letter-writing campaign
            </p>
          </div>

          <ProgressStepper step={step} totalSteps={3} labels={stepLabels} />

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {step === 1 && <CampaignDetailsForm />}
                {step === 2 && (
                  <LetterTemplatesStep
                    letterTemplates={letterTemplates}
                    setLetterTemplates={setLetterTemplates}
                  />
                )}
                {step === 3 && (
                  <RecipientsStep
                    selectedRecipients={selectedRecipients}
                    setSelectedRecipients={setSelectedRecipients}
                  />
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}

                  <div className="ml-auto">
                    {step < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-campaign-accent hover:bg-campaign-accent/90"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-campaign-accent hover:bg-campaign-accent/90"
                      >
                        Create Campaign
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CreateCampaign;
