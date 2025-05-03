import { Campaign } from '@/types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Save Local Wildlife Habitat',
    description: 'Help protect the natural habitats of endangered species in our community.',
    imageUrl: '/uploads/GoGEtActionImage01.png',
    createdAt: '2023-04-15',
    targetGoal: 500,
    lettersCount: 342,
    category: 'Environment',
    slug: 'save-local-wildlife-habitat',
  },
  {
    id: '2',
    title: 'Affordable Housing Initiative',
    description: 'Support legislation for more affordable housing in our growing city.',
    imageUrl: '/uploads/GoGEtActionImage03.png',
    createdAt: '2023-03-22',
    targetGoal: 1000,
    lettersCount: 756,
    category: 'Housing',
    slug: 'affordable-housing-initiative',
  },
  {
    id: '3',
    title: 'Clean Water Access',
    description: 'Advocate for clean water access in underserved communities.',
    imageUrl: '/uploads/GoGEtActionImage05.png',
    createdAt: '2023-05-10',
    targetGoal: 750,
    lettersCount: 489,
    category: 'Environment',
    slug: 'clean-water-access',
  },
  {
    id: '4',
    title: 'Support Local Arts Education',
    description: 'Help maintain funding for arts education programs in public schools.',
    imageUrl: '/placeholder.svg',
    createdAt: '2023-02-18',
    targetGoal: 300,
    lettersCount: 203,
    category: 'Education',
    slug: 'support-local-arts-education',
  },
  {
    id: '5',
    title: 'Mental Health Resources',
    description: 'Advocate for better mental health resources and support services.',
    imageUrl: '/placeholder.svg',
    createdAt: '2023-06-05',
    targetGoal: 600,
    lettersCount: 411,
    category: 'Healthcare',
    slug: 'mental-health-resources',
  },
  {
    id: '6',
    title: 'Neighborhood Safety Initiative',
    description: 'Support efforts to improve safety measures in local neighborhoods.',
    imageUrl: '/placeholder.svg',
    createdAt: '2023-04-28',
    targetGoal: 400,
    lettersCount: 289,
    category: 'Community',
    slug: 'neighborhood-safety-initiative',
  },
  {
    id: '7',
    title: 'Small Business Support',
    description: 'Help small businesses recover and thrive in our community.',
    imageUrl: '/placeholder.svg',
    createdAt: '2023-03-15',
    targetGoal: 500,
    lettersCount: 312,
    category: 'Business',
    slug: 'small-business-support',
  },
  {
    id: '8',
    title: 'Green Energy Transition',
    description: 'Advocate for policies that promote renewable energy adoption.',
    imageUrl: '/placeholder.svg',
    createdAt: '2023-05-22',
    targetGoal: 850,
    lettersCount: 521,
    category: 'Environment',
    slug: 'green-energy-transition',
  },
];

export const categories = Array.from(new Set(mockCampaigns.map(campaign => campaign.category)));

export const mockLetterTemplates = [
  {
    id: '1',
    campaignId: '1',
    title: 'Wildlife Protection Letter',
    content:
      'Dear Representative,\n\nI am writing to express my concern about the diminishing wildlife habitats in our area. The recent developments have significantly reduced the natural spaces where local wildlife thrives.\n\nI urge you to support legislation that protects these valuable ecosystems and considers the impact of development on our local wildlife.\n\nThank you for your consideration,\n[Your Name]',
  },
  {
    id: '2',
    campaignId: '1',
    title: 'Conservation Funding Request',
    content:
      'Dear City Council,\n\nI am writing to request increased funding for conservation efforts in our community. Our local wildlife depends on these habitats, and their protection should be a priority.\n\nPlease allocate additional resources toward conservation initiatives in the upcoming budget.\n\nSincerely,\n[Your Name]',
  },
];

export const letterTemplates = mockLetterTemplates;

export const testimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Community Activist',
    content:
      'CauseLetter helped my environmental campaign reach decision-makers directly. We gathered over 500 letters and saw real policy changes as a result!',
    avatarUrl: '/placeholder.svg',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Housing Advocate',
    content:
      "Our affordable housing initiative gained serious momentum thanks to the letter campaign we ran through CauseLetter. It's an incredibly effective tool for advocacy.",
    avatarUrl: '/placeholder.svg',
  },
  {
    id: '3',
    name: 'Priya Patel',
    role: 'Education Reform Advocate',
    content:
      'The platform made it easy for supporters to send personalized letters to their representatives. We achieved our goal in half the expected time!',
    avatarUrl: '/placeholder.svg',
  },
];
