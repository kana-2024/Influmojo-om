'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CreatorCard from './CreatorCard';
import FilterModal, { CreatorFilters } from './FilterModal';
import { profileAPI } from '@/services/apiService';
import { toast } from 'react-hot-toast';

interface Creator {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
  bio?: string;
  city?: string;
  state?: string;
  rating?: number;
  total_collaborations?: number;
  average_response_time?: string;
  content_categories?: string[];
  languages?: string[];
  social_accounts?: Array<{
    platform: string;
    username: string;
    follower_count: number;
    engagement_rate: number;
    verified: boolean;
  }>;
  packages?: Array<{
    id: string;
    title: string;
    price: number;
    currency: string;
    deliverables: {
      platform: string;
      content_type: string;
      quantity: number;
      revisions: number;
      duration1: string;
      duration2: string;
    };
  }>;
}

interface CreatorDiscoveryProps {
  onViewCreatorProfile: (creatorId: string) => void;
  onAddToCart?: (packageId: string, creatorId: string) => void;
  showAddToCart?: boolean;
}

const CreatorDiscovery: React.FC<CreatorDiscoveryProps> = ({
  onViewCreatorProfile,
  onAddToCart,
  showAddToCart = false,
}) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CreatorFilters>({
    platforms: [],
    categories: [],
    followerRange: { min: 0, max: 10000000 },
    priceRange: 'all',
    location: '',
    verifiedOnly: false,
    hasPackages: false,
  });

  // Fetch creators on component mount
  useEffect(() => {
    fetchCreators();
  }, []);

  // Apply filters and search when they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [creators, filters, searchQuery]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching creators for discovery...');
      const response = await profileAPI.getCreators();
      
      if (response.success && response.data) {
        console.log('✅ Creators fetched successfully:', response.data);
        
        // Transform the data to match our Creator interface
        const transformedCreators: Creator[] = [];
        
        // Process each platform's creators
        Object.entries(response.data).forEach(([platform, platformCreators]) => {
          if (Array.isArray(platformCreators)) {
            platformCreators.forEach((creator: any) => {
              // Add platform info to social accounts if not present
              const socialAccounts = creator.social_accounts || [];
              if (socialAccounts.length === 0 && creator.social_account) {
                socialAccounts.push({
                  platform: platform,
                  username: creator.social_account.username || '',
                  follower_count: creator.social_account.follower_count || 0,
                  engagement_rate: creator.social_account.engagement_rate || 0,
                  verified: creator.social_account.verified || false,
                });
              }
              
              transformedCreators.push({
                id: creator.id,
                name: creator.name || creator.fullName || 'Unknown Creator',
                email: creator.email || '',
                profile_image_url: creator.profile_image_url || creator.avatar,
                bio: creator.bio || creator.about || '',
                city: creator.city || creator.location_city,
                state: creator.state || creator.location_state,
                rating: creator.rating || 0,
                total_collaborations: creator.total_collaborations || 0,
                average_response_time: creator.average_response_time || '1HR - 3HR',
                content_categories: creator.content_categories || creator.categories || [],
                languages: creator.languages || [],
                social_accounts: socialAccounts,
                packages: creator.packages || [],
              });
            });
          }
        });
        
        console.log('🔍 Transformed creators:', transformedCreators);
        setCreators(transformedCreators);
      } else {
        console.error('❌ Failed to fetch creators:', response.error);
        setError(response.error || 'Failed to fetch creators');
      }
    } catch (err) {
      console.error('❌ Error loading creators:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...creators];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(creator =>
        creator.name.toLowerCase().includes(query) ||
        creator.bio?.toLowerCase().includes(query) ||
        creator.content_categories?.some(cat => cat.toLowerCase().includes(query)) ||
        creator.city?.toLowerCase().includes(query) ||
        creator.state?.toLowerCase().includes(query)
      );
    }

    // Apply platform filters
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(creator =>
        creator.social_accounts?.some(acc => 
          filters.platforms.includes(acc.platform.toLowerCase())
        )
      );
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(creator =>
        creator.content_categories?.some(cat => 
          filters.categories.includes(cat)
        )
      );
    }

    // Apply follower range filters
    if (filters.followerRange.min > 0 || filters.followerRange.max < 10000000) {
      filtered = filtered.filter(creator => {
        const maxFollowers = Math.max(...(creator.social_accounts?.map(acc => acc.follower_count) || [0]));
        return maxFollowers >= filters.followerRange.min && maxFollowers <= filters.followerRange.max;
      });
    }

    // Apply price range filters
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(creator => {
        if (!creator.packages || creator.packages.length === 0) return false;
        
        const packagePrices = creator.packages.map(pkg => pkg.price);
        const minPrice = Math.min(...packagePrices);
        const maxPrice = Math.max(...packagePrices);
        
        switch (filters.priceRange) {
          case '0-1000':
            return maxPrice <= 1000;
          case '1000-5000':
            return minPrice >= 1000 && maxPrice <= 5000;
          case '5000-10000':
            return minPrice >= 5000 && maxPrice <= 10000;
          case '10000-50000':
            return minPrice >= 10000 && maxPrice <= 50000;
          case '50000+':
            return minPrice >= 50000;
          default:
            return true;
        }
      });
    }

    // Apply location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(creator =>
        creator.city?.toLowerCase().includes(location) ||
        creator.state?.toLowerCase().includes(location)
      );
    }

    // Apply verified filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(creator =>
        creator.social_accounts?.some(acc => acc.verified)
      );
    }

    // Apply has packages filter
    if (filters.hasPackages) {
      filtered = filtered.filter(creator =>
        creator.packages && creator.packages.length > 0
      );
    }

    setFilteredCreators(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFiltersChange = (newFilters: CreatorFilters) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleAddToCart = async (packageId: string, creatorId: string) => {
    try {
      const response = await profileAPI.addToCart(packageId, creatorId, 1);
      if (response.success) {
        toast.success('Package added to cart successfully!');
      } else {
        toast.error(response.error || 'Failed to add package to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add package to cart');
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.platforms.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.followerRange.min > 0 || filters.followerRange.max < 10000000) count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.location) count++;
    if (filters.verifiedOnly) count++;
    if (filters.hasPackages) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XMarkIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Creators</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCreators}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search creators by name, bio, categories, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(true)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              getActiveFiltersCount() > 0
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.platforms.map(platform => (
              <span key={platform} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            ))}
            {filters.categories.map(category => (
              <span key={category} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {category}
              </span>
            ))}
            {filters.location && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                📍 {filters.location}
              </span>
            )}
            {filters.verifiedOnly && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                ✓ Verified
              </span>
            )}
            {filters.hasPackages && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                📦 Has Packages
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {filteredCreators.length} Creator{filteredCreators.length !== 1 ? 's' : ''} Found
        </h2>
        {filteredCreators.length > 0 && (
          <p className="text-sm text-gray-500">
            Showing {Math.min(filteredCreators.length, 20)} of {filteredCreators.length}
          </p>
        )}
      </div>

      {/* Creators Grid */}
      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCreators.slice(0, 20).map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onViewProfile={onViewCreatorProfile}
                onAddToCart={handleAddToCart}
                showAddToCart={showAddToCart}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No creators found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || getActiveFiltersCount() > 0
              ? 'Try adjusting your search or filters'
              : 'No creators are available at the moment'
            }
          </p>
          {(searchQuery || getActiveFiltersCount() > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  platforms: [],
                  categories: [],
                  followerRange: { min: 0, max: 10000000 },
                  priceRange: 'all',
                  location: '',
                  verifiedOnly: false,
                  hasPackages: false,
                });
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Load More Button */}
      {filteredCreators.length > 20 && (
        <div className="text-center">
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Load More Creators
          </button>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleFiltersChange}
        currentFilters={filters}
      />
    </div>
  );
};

export default CreatorDiscovery;
