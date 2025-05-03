import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LetterTemplate } from '@/types';

interface LetterTemplateCardProps {
  template: LetterTemplate;
  onSelect: (templateId: string, selected: boolean) => void;
  selected: boolean;
}

const LetterTemplateCard = ({ template, onSelect, selected }: LetterTemplateCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(template.id, e.target.checked);
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-shadow duration-200 ${selected ? 'border-campaign-accent shadow-md bg-blue-50/30' : 'border-gray-200'}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{template.title}</h4>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`template-${template.id}`}
                checked={selected}
                onChange={handleSelectChange}
                className="h-4 w-4 text-campaign-accent rounded border-gray-300 focus:ring-campaign-accent"
              />
              <label
                htmlFor={`template-${template.id}`}
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Select
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="p-1"
              aria-label={expanded ? 'Hide letter content' : 'Show letter content'}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
        <div
          className={`mt-2 overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-0'}`}
        >
          <div className="bg-white p-4 rounded border border-gray-200 whitespace-pre-line">
            {template.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterTemplateCard;
