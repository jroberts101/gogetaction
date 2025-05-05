import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import LetterTemplateCard from '@/components/campaigns/LetterTemplateCard';
import { Campaign, LetterTemplate } from '@/types';
import { mockCampaigns, mockLetterTemplates } from '@/data/mockData';
import { Calendar, Mail, AlertCircle, Bookmark, Share2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const CampaignDetail = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, we would fetch from an API
    if (campaignId) {
      const foundCampaign = mockCampaigns.find(c => c.id === campaignId);
      const campaignTemplates = mockLetterTemplates[campaignId] || [];

      setTimeout(() => {
        setCampaign(foundCampaign || null);
        setTemplates(campaignTemplates);
        setLoading(false);
      }, 300); // Simulate network request
    }
  }, [campaignId]);

  const handleTemplateSelect = (templateId: string, selected: boolean) => {
    if (selected) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    } else {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    }
  };

  const handleStartLetterProcess = () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select at least one letter template');
      return;
    }

    // In a real app, we would navigate to the letter sending flow with the selected templates
    toast.success(`Selected ${selectedTemplates.length} templates to send`);
    console.log('Selected templates:', selectedTemplates);
  };

  const handleShareCampaign = () => {
    // In a real app, we would open a share dialog or copy link to clipboard
    toast.success('Campaign link copied to clipboard!');
  };

  const handleSaveCampaign = () => {
    // In a real app, we would save the campaign to user favorites
    toast.success('Campaign saved to your favorites!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-gray-600 mb-6">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/campaigns" className="text-campaign-accent hover:underline">
              Browse other campaigns
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(campaign.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const progress = campaign.targetGoal
    ? Math.min(Math.round((campaign.lettersCount / campaign.targetGoal) * 100), 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{campaign.title} | CauseLetter</title>
        <meta name="description" content={campaign.description.substring(0, 160)} />
        <meta property="og:title" content={`${campaign.title} | CauseLetter`} />
        <meta property="og:description" content={campaign.description.substring(0, 160)} />
        <meta property="og:image" content={campaign.imageUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {/* Campaign header */}
          <div className="relative">
            <div className="h-48 md:h-64 lg:h-96 w-full overflow-hidden">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={e => {
                  // Fallback image
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e';
                  target.onerror = null;
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center px-4">
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center shadow-text max-w-4xl">
                {campaign.title}
              </h1>
            </div>
          </div>

          {/* Campaign details */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main content */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Started {formattedDate}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveCampaign}
                        className="flex items-center space-x-1"
                      >
                        <Bookmark className="h-4 w-4" />
                        <span>Save</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareCampaign}
                        className="flex items-center space-x-1"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-lg whitespace-pre-line">{campaign.description}</p>
                  </div>
                </div>

                {/* Letter templates section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-6">Letter Templates</h2>
                  {templates.length > 0 ? (
                    <div className="space-y-4">
                      {templates.map(template => (
                        <LetterTemplateCard
                          key={template.id}
                          template={template}
                          onSelect={handleTemplateSelect}
                          selected={selectedTemplates.includes(template.id)}
                        />
                      ))}
                      <div className="mt-8">
                        <Button
                          onClick={handleStartLetterProcess}
                          className="w-full bg-campaign-accent hover:bg-campaign-accent/90 text-white"
                        >
                          {selectedTemplates.length === 0
                            ? 'Select templates to send'
                            : `Continue with ${selectedTemplates.length} selected template${
                                selectedTemplates.length === 1 ? '' : 's'
                              }`}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No letter templates available for this campaign.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6">
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm font-medium mb-2">
                      {campaign.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2">Campaign Status</h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{campaign.lettersCount} letters sent</span>
                      {campaign.targetGoal && <span>Target: {campaign.targetGoal} letters</span>}
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    {campaign.targetGoal && (
                      <p className="text-sm text-gray-600">{progress}% of the target reached</p>
                    )}
                  </div>

                  <div className="flex items-center mb-6 p-3 bg-blue-50 rounded-lg text-campaign-primary">
                    <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">
                      Letters are processed within 1-2 business days and typically delivered within
                      3-5 business days.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      if (selectedTemplates.length === 0) {
                        // Scroll to templates section
                        const templatesSection = document.getElementById('templates-section');
                        templatesSection?.scrollIntoView({ behavior: 'smooth' });
                        toast.error('Please select at least one letter template');
                      } else {
                        handleStartLetterProcess();
                      }
                    }}
                    className="w-full bg-campaign-accent hover:bg-campaign-accent/90 text-white"
                  >
                    Send Letters Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CampaignDetail;
