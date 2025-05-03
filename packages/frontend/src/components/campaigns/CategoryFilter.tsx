import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { categories } from '@/data/mockData';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange, onSearch }: CategoryFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="campaign-form-input pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-campaign-accent"
            aria-label="Search campaigns"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Mobile filter toggle */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Desktop categories */}
        <div className="hidden md:flex overflow-x-auto space-x-2 py-1">
          {categories.slice(0, 6).map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={
                selectedCategory === category
                  ? 'bg-campaign-accent hover:bg-campaign-accent/90'
                  : 'hover:bg-gray-100'
              }
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile categories */}
      {mobileFiltersOpen && (
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={
                selectedCategory === category
                  ? 'bg-campaign-accent hover:bg-campaign-accent/90'
                  : 'hover:bg-gray-100'
              }
              onClick={() => {
                onCategoryChange(category);
                setMobileFiltersOpen(false);
              }}
            >
              {category}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
