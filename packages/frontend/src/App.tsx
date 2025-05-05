import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Index from './pages/Index';
import CampaignsList from './pages/CampaignsList';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import HowItWorks from './pages/HowItWorks';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// Create router with future flags enabled to prevent warnings
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Index />} />
      <Route path="/campaigns" element={<CampaignsList />} />
      <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
      <Route path="/create-campaign" element={<CreateCampaign />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Helmet>
            <title>GoGetAction - Empower Your Cause</title>
            <meta
              name="description"
              content="Create impactful campaigns and mobilize supporters to send powerful letters to decision-makers."
            />
          </Helmet>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
