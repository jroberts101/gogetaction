import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { CampaignFormData } from '@/types/campaign';

const CampaignDetailsForm = () => {
  const form = useFormContext<CampaignFormData>();

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        rules={{ required: 'Campaign title is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campaign Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter a clear, attention-grabbing title" {...field} />
            </FormControl>
            <FormDescription>A compelling title will help your campaign stand out</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        rules={{ required: 'Campaign description is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Explain what your campaign is about and why it matters"
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide context about the issue and what action you want supporters to take
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        rules={{ required: 'Category is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Environment, Education, Human Rights" {...field} />
            </FormControl>
            <FormDescription>
              Choose a category that best represents your campaign's focus
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Letter Goal</FormLabel>
            <FormControl>
              <Input type="number" min="1" {...field} />
            </FormControl>
            <FormDescription>Set a target number of letters you aim to send</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CampaignDetailsForm;
