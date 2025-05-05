import React from 'react';
import { PenLine, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LetterTemplateEditor from './LetterTemplateEditor';
import { LetterTemplate } from '@/types/campaign';
import { toast } from 'sonner';

interface LetterTemplatesStepProps {
  letterTemplates: LetterTemplate[];
  setLetterTemplates: React.Dispatch<React.SetStateAction<LetterTemplate[]>>;
}

const LetterTemplatesStep: React.FC<LetterTemplatesStepProps> = ({
  letterTemplates,
  setLetterTemplates,
}) => {
  const addLetterTemplate = () => {
    const newId = (letterTemplates.length + 1).toString();
    setLetterTemplates([
      ...letterTemplates,
      {
        id: newId,
        title: `Template ${newId}`,
        content:
          '<p>Dear Decision Maker,</p><p>Write your letter content here...</p><p>Sincerely,<br>Your Name</p>',
      },
    ]);
  };

  const updateLetterTemplate = (id: string, field: keyof LetterTemplate, value: string) => {
    setLetterTemplates(
      letterTemplates.map(template =>
        template.id === id ? { ...template, [field]: value } : template
      )
    );
  };

  const removeLetterTemplate = (id: string) => {
    if (letterTemplates.length > 1) {
      setLetterTemplates(letterTemplates.filter(template => template.id !== id));
    } else {
      toast.error('You must have at least one letter template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-campaign-text">Letter Templates</h2>
        <Button
          type="button"
          onClick={addLetterTemplate}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-campaign-accent text-campaign-accent"
        >
          <Plus size={16} />
          Add Template
        </Button>
      </div>
      <p className="text-campaign-muted mb-6">
        Create templates that your supporters can use or customize when sending letters. Use the
        formatting toolbar to style your content.
      </p>

      <div className="space-y-6">
        {letterTemplates.map(template => (
          <Card key={template.id} className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PenLine size={18} className="text-campaign-accent" />
                  <Input
                    value={template.title}
                    onChange={e => updateLetterTemplate(template.id, 'title', e.target.value)}
                    placeholder="Template Title"
                    className="max-w-[300px] border-0 p-0 focus-visible:ring-0 text-lg font-medium"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLetterTemplate(template.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={letterTemplates.length === 1}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <LetterTemplateEditor
                content={template.content}
                onChange={content => updateLetterTemplate(template.id, 'content', content)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LetterTemplatesStep;
