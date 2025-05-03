export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  targetGoal?: number;
  lettersCount: number;
  category: string;
  slug: string;
}

export interface LetterTemplate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
}

export interface Recipient {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'general' | 'campaigner';
}
