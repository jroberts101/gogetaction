import { Link } from 'react-router-dom';
import { Campaign } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Calendar, Mail } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const { id, title, description, imageUrl, targetGoal, lettersCount, category, createdAt } =
    campaign;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const progress = targetGoal ? Math.min(Math.round((lettersCount / targetGoal) * 100), 100) : 0;

  // Limit description to avoid long cards
  const truncatedDescription =
    description.length > 140 ? `${description.substring(0, 140)}...` : description;

  return (
    <div className="campaign-card group h-full flex flex-col">
      <Link to={`/campaigns/${id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${title} campaign`}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            onError={e => {
              // Fallback image if the original fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e';
              target.onerror = null; // Prevent infinite fallback loops
            }}
          />
          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-white/90 rounded-md text-sm font-medium text-campaign-text">
            {category}
          </div>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <Link to={`/campaigns/${id}`} className="block">
          <h3 className="font-bold text-xl mb-2 hover:text-campaign-accent transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{truncatedDescription}</p>
        </Link>

        {targetGoal ? (
          <div className="mt-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{lettersCount} letters sent</span>
              <span>{progress}% of goal</span>
            </div>
            <Progress value={progress} className="h-2 mb-3" />
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-600 space-x-1 mt-auto mb-3">
            <Mail className="h-4 w-4" />
            <span>{lettersCount} letters sent</span>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Started {formattedDate}</span>
          </div>
          <Link
            to={`/campaigns/${id}`}
            className="font-medium text-campaign-accent hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
