import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CampaignCard from '@/components/campaigns/CampaignCard';
import CategoryFilter from '@/components/campaigns/CategoryFilter';
import { Campaign } from '@/types';
import { mockCampaigns } from '@/data/mockData';

const CampaignsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Get query parameters from URL
    const category = searchParams.get('category') || 'All Categories';
    const query = searchParams.get('q') || '';

    setSelectedCategory(category);
    setSearchQuery(query);

    filterCampaigns(category, query);
  }, [searchParams]);

  const filterCampaigns = (category: string, query: string) => {
    let filtered = [...mockCampaigns];

    // Filter by category
    if (category && category !== 'All Categories') {
      filtered = filtered.filter(campaign => campaign.category === category);
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        campaign =>
          campaign.title.toLowerCase().includes(lowerQuery) ||
          campaign.description.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredCampaigns(filtered);
  };

  const handleCategoryChange = (category: string) => {
    searchParams.set('category', category);
    if (searchQuery) {
      searchParams.set('q', searchQuery);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (query: string) => {
    if (query) {
      searchParams.set('q', query);
    } else {
      searchParams.delete('q');
    }
    if (selectedCategory !== 'All Categories') {
      searchParams.set('category', selectedCategory);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <Helmet>
        <title>Browse Campaigns | CauseLetter</title>
        <meta
          name="description"
          content="Discover causes that matter to you. Browse letter-writing campaigns and make your voice heard on important issues."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-campaign-text mb-2">Browse Campaigns</h1>
              <p className="text-gray-600">
                Discover campaigns that matter to you and help make a difference through
                letter-writing.
              </p>
            </div>

            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onSearch={handleSearch}
            />

            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-campaign-text mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No campaigns match your search for "${searchQuery}"`
                    : `No campaigns found in the "${selectedCategory}" category`}
                </p>
                <button
                  onClick={() => {
                    setSearchParams({});
                  }}
                  className="text-campaign-accent hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CampaignsList;
