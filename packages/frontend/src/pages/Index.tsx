import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedCampaigns from '@/components/campaigns/FeaturedCampaigns';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';
import { mockCampaigns } from '@/data/mockData';

const Index = () => {
  // Use the first 6 campaigns for the featured section
  const featuredCampaigns = mockCampaigns.slice(0, 6);

  return (
    <>
      <Helmet>
        <title>GoGetAction - Empower Your Cause With Advocacy Campaigns</title>
        <meta
          name="description"
          content="Create impactful campaigns and mobilize supporters to send powerful letters to decision-makers. Make your voice heard and drive meaningful change."
        />
        <meta
          property="og:title"
          content="GoGetAction - Empower Your Cause With Advocacy Campaigns"
        />
        <meta
          property="og:description"
          content="Create impactful campaigns and mobilize supporters to send powerful letters to decision-makers."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <HowItWorks />
          <FeaturedCampaigns campaigns={featuredCampaigns} title="Featured Campaigns" />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
