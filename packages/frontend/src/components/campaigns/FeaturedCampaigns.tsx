import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '@/types';
import CampaignCard from './CampaignCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCampaignsProps {
  campaigns: Campaign[];
  title?: string;
  viewAllLink?: string;
}

const FeaturedCampaigns = ({
  campaigns,
  title = 'Featured Campaigns',
  viewAllLink = '/campaigns',
}: FeaturedCampaignsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, campaigns.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const visibleCampaigns = campaigns.slice(currentIndex, currentIndex + itemsPerPage);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-campaign-text">{title}</h2>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={!canScrollLeft}
                aria-label="Previous campaigns"
                className={`rounded-full ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={!canScrollRight}
                aria-label="Next campaigns"
                className={`rounded-full ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Link to={viewAllLink} className="text-campaign-accent hover:underline font-medium">
              View All
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={!canScrollLeft}
              aria-label="Previous campaigns"
              className={`rounded-full ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={!canScrollRight}
              aria-label="Next campaigns"
              className={`rounded-full ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
