'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PlatformCreatorSection from './PlatformCreatorSection';
import FilterModal, { CreatorFilters } from './FilterModal';
import { profileAPI } from '@/services/apiService';
import { toast } from 'react-hot-toast';
import CartService from '@/services/cartService';

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
  platform?: string;
}

interface CreatorDiscoveryProps {
  onViewCreatorProfile: (creatorId: string, creatorData: Creator) => void;

  showAddToCart?: boolean;
}

const CreatorDiscovery: React.FC<CreatorDiscoveryProps> = ({
  onViewCreatorProfile,
  showAddToCart = false,
}) => {
  const [creators, setCreators] = useState<Record<string, Creator[]>>({});
  const [filteredCreators, setFilteredCreators] = useState<Record<string, Creator[]>>({});
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


  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching creators for discovery...');
      const response = await profileAPI.getCreators();
      
      if (response.success && response.data) {
        console.log('✅ Creators fetched successfully:', response.data);
        console.log('🔍 Raw backend response structure:', Object.keys(response.data));
        
        // We need to re-group creators by their actual package platforms
        // instead of using the backend's social media preference grouping
        const platformGroups: Record<string, Creator[]> = {};
        
        // First, collect all creators and their packages
        const allCreators: Creator[] = [];
        
        Object.entries(response.data).forEach(([backendPlatform, platformCreators]) => {
          console.log(`🔍 Processing backend platform group: ${backendPlatform}`);
          console.log(`🔍 Creators in this group:`, platformCreators);
          
          if (Array.isArray(platformCreators)) {
            platformCreators.forEach((creator: Creator) => {
              // Process creator data
              const socialAccounts = creator.social_accounts || [];
              if (socialAccounts.length === 0) {
                socialAccounts.push({
                  platform: backendPlatform,
                  username: creator.name || '',
                  follower_count: 0,
                  engagement_rate: 0,
                  verified: false,
                });
              }
              
              // Process packages and ensure they have platform info
              const packages = creator.packages || [];
              console.log(`🔍 Processing packages for creator ${creator.name}:`, packages);
              
              packages.forEach((pkg: {
                title?: string;
                content_type?: string;
                type?: string;
                platform?: string;
                deliverables?: {
                  platform?: string;
                  content_type?: string;
                  quantity?: number;
                  revisions?: number;
                  duration1?: string;
                  duration2?: string;
                };
                quantity?: number;
                revisions?: number;
                duration1?: string;
                duration2?: string;
                currency?: string;
              }) => {
                // Extract the actual package platform from the package data
                let packagePlatform = '';
                
                console.log(`🔍 Processing package:`, pkg);
                console.log(`🔍 Package title: "${pkg.title}"`);
                console.log(`🔍 Package content_type: "${pkg.content_type}"`);
                console.log(`🔍 Package deliverables:`, pkg.deliverables);
                console.log(`🔍 Package platform field: "${pkg.platform}"`);
                
                // Check multiple possible sources for package platform
                if (pkg.deliverables && pkg.deliverables.platform) {
                  packagePlatform = pkg.deliverables.platform;
                  console.log(`✅ Found platform in deliverables: ${packagePlatform}`);
                } else if (pkg.platform) {
                  packagePlatform = pkg.platform;
                  console.log(`✅ Found platform in package: ${packagePlatform}`);
                } else if (pkg.content_type && pkg.content_type.toLowerCase().includes('instagram')) {
                  packagePlatform = 'instagram';
                  console.log(`✅ Detected Instagram from content_type: ${pkg.content_type}`);
                } else if (pkg.content_type && pkg.content_type.toLowerCase().includes('youtube')) {
                  packagePlatform = 'youtube';
                  console.log(`✅ Detected YouTube from content_type: ${pkg.content_type}`);
                } else if (pkg.title && pkg.title.toLowerCase().includes('instagram')) {
                  packagePlatform = 'instagram';
                  console.log(`✅ Detected Instagram from title: ${pkg.title}`);
                } else if (pkg.title && pkg.title.toLowerCase().includes('youtube')) {
                  packagePlatform = 'youtube';
                  console.log(`✅ Detected YouTube from title: ${pkg.title}`);
                } else if (pkg.title && pkg.title.toLowerCase().includes('reel')) {
                  // If it's a reel, check if we can infer platform from other context
                  if (backendPlatform.toLowerCase() === 'instagram') {
                    packagePlatform = 'instagram';
                    console.log(`✅ Detected Instagram from reel + backend context`);
                  } else if (backendPlatform.toLowerCase() === 'youtube') {
                    packagePlatform = 'youtube';
                    console.log(`✅ Detected YouTube from reel + backend context`);
                  } else {
                    packagePlatform = 'instagram'; // Default for reels
                    console.log(`✅ Defaulting reel to Instagram`);
                  }
                } else {
                  // Fallback to backend platform if no package-specific platform found
                  packagePlatform = backendPlatform;
                  console.log(`⚠️ Using fallback backend platform: ${packagePlatform}`);
                }
                
                console.log(`🎯 Final package platform: ${packagePlatform}`);
                
                // Ensure deliverables structure exists and has correct platform
                if (!pkg.deliverables) {
                  pkg.deliverables = {
                    platform: packagePlatform,
                    content_type: pkg.content_type || pkg.type || 'content',
                    quantity: pkg.quantity || 1,
                    revisions: pkg.revisions || 1,
                    duration1: pkg.duration1 || '1-2 days',
                    duration2: pkg.duration2 || '3-5 days'
                  };
                  console.log(`🔧 Created deliverables structure:`, pkg.deliverables);
                } else if (!pkg.deliverables.platform) {
                  pkg.deliverables.platform = packagePlatform;
                  console.log(`🔧 Updated deliverables platform: ${packagePlatform}`);
                }
                
                // Ensure other required fields
                if (!pkg.currency) pkg.currency = 'INR';
              });
              
              const processedCreator: Creator = {
                id: creator.id,
                name: creator.name || 'Unknown Creator',
                email: creator.email || '',
                profile_image_url: creator.profile_image_url || '',
                bio: creator.bio || '',
                city: creator.city || '',
                state: creator.state || '',
                rating: creator.rating || 0,
                total_collaborations: creator.total_collaborations || 0,
                average_response_time: creator.average_response_time || '1HR - 3HR',
                content_categories: creator.content_categories || [],
                languages: creator.languages || [],
                social_accounts: socialAccounts,
                packages: packages,
                platform: backendPlatform, // Keep original platform for reference
              };
              
              allCreators.push(processedCreator);
            });
          }
        });
        
        console.log('🔍 All creators collected:', allCreators.length);
        
        // Debug: Log package data for each creator
        allCreators.forEach((creator, index) => {
          console.log(`🔍 Creator ${index + 1}: ${creator.name}`);
          if (creator.packages && creator.packages.length > 0) {
            creator.packages.forEach((pkg, pkgIndex) => {
              console.log(`  📦 Package ${pkgIndex + 1}:`, {
                title: pkg.title,
                price: pkg.price,
                platform: pkg.deliverables?.platform,
                content_type: pkg.deliverables?.content_type,
                quantity: pkg.deliverables?.quantity,
                revisions: pkg.deliverables?.revisions,
                duration1: pkg.deliverables?.duration1,
                duration2: pkg.deliverables?.duration2,
                raw_package: pkg
              });
            });
          } else {
            console.log(`  ❌ No packages found`);
          }
        });
        
        // Now group creators by their actual package platforms
        allCreators.forEach((creator) => {
          if (creator.packages && creator.packages.length > 0) {
            // Create separate creator instances for each package platform
            creator.packages.forEach((pkg) => {
              const packagePlatform = pkg.deliverables?.platform?.toLowerCase() || 'other';
              
              if (!platformGroups[packagePlatform]) {
                platformGroups[packagePlatform] = [];
              }
              
              // Create a new creator instance with only the packages for this platform
              const platformSpecificCreator: Creator = {
                ...creator,
                packages: [pkg], // Only include packages for this specific platform
              };
              
              // Check if creator is already in this platform group
              const existingCreator = platformGroups[packagePlatform].find(c => c.id === creator.id);
              if (!existingCreator) {
                platformGroups[packagePlatform].push(platformSpecificCreator);
              }
            });
          }
        });
        
        console.log('🔍 Final platform groups:', Object.keys(platformGroups).map(p => `${p}: ${platformGroups[p].length}`));
        
        // Store the platform groups for display
        setCreators(platformGroups);
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

  const applyFiltersAndSearch = useCallback(() => {
    if (!creators || typeof creators !== 'object') return;
    
    const filteredGroups: Record<string, Creator[]> = {};
    
    Object.entries(creators).forEach(([platform, platformCreators]) => {
      let filtered = [...platformCreators];
      
      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(creator => 
          creator.name.toLowerCase().includes(query) ||
          creator.bio?.toLowerCase().includes(query) ||
          creator.content_categories?.some((cat: string) => cat.toLowerCase().includes(query)) ||
          creator.city?.toLowerCase().includes(query) ||
          creator.state?.toLowerCase().includes(query)
        );
      }
      
      // Apply platform filters
      if (filters.platforms.length > 0) {
        filtered = filtered.filter(creator => 
          creator.social_accounts?.some((acc) => filters.platforms.includes(acc.platform.toLowerCase()))
        );
      }
      
      // Apply category filters
      if (filters.categories.length > 0) {
        filtered = filtered.filter(creator => 
          creator.content_categories?.some((cat: string) => filters.categories.includes(cat))
        );
      }
      
      // Apply follower range filters
      if (filters.followerRange.min > 0 || filters.followerRange.max < 10000000) {
        filtered = filtered.filter(creator => {
          const maxFollowers = Math.max(...(creator.social_accounts?.map((acc) => acc.follower_count) || [0]));
          return maxFollowers >= filters.followerRange.min && maxFollowers <= filters.followerRange.max;
        });
      }
      
      // Apply price range filters
      if (filters.priceRange !== 'all') {
        filtered = filtered.filter(creator => {
          if (!creator.packages || creator.packages.length === 0) return false;
          const packagePrices = creator.packages.map((pkg) => pkg.price);
          const minPrice = Math.min(...packagePrices);
          const maxPrice = Math.max(...packagePrices);
          
          switch (filters.priceRange) {
            case '0-1000': return maxPrice <= 1000;
            case '1000-5000': return minPrice >= 1000 && maxPrice <= 5000;
            case '5000-10000': return minPrice >= 5000 && maxPrice <= 10000;
            case '10000+': return minPrice >= 10000;
            default: return true;
          }
        });
      }
      
      // Apply location filter
      if (filters.location) {
        const location = filters.location.toLowerCase();
        filtered = filtered.filter(creator => 
          creator.city?.toLowerCase().includes(location) ||
          creator.state?.toLowerCase().includes(location)
        );
      }
      
      // Apply verified only filter
      if (filters.verifiedOnly) {
        filtered = filtered.filter(creator => 
          creator.social_accounts?.some((acc) => acc.verified)
        );
      }
      
      // Apply has packages filter
      if (filters.hasPackages) {
        filtered = filtered.filter(creator => 
          creator.packages && creator.packages.length > 0
        );
      }
      
      if (filtered.length > 0) {
        filteredGroups[platform] = filtered;
      }
    });
    
    setFilteredCreators(filteredGroups);
  }, [creators, filters, searchQuery]);

  // Apply filters and search when they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [creators, filters, searchQuery, applyFiltersAndSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFiltersChange = (newFilters: CreatorFilters) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery('');
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
          {Object.values(filteredCreators).flat().length} Creator{Object.values(filteredCreators).flat().length !== 1 ? 's' : ''} Found
        </h2>
        <div className="flex items-center gap-4">
          {Object.values(filteredCreators).flat().length > 0 && (
            <p className="text-sm text-gray-500">
              Showing {Math.min(Object.values(filteredCreators).flat().length, 20)} of {Object.values(filteredCreators).flat().length}
            </p>
          )}
          {/* Test Add to Cart Button */}
          <button
            onClick={() => {
              // Add a test package to cart
              CartService.addToCart({
                creatorId: 'test-creator-1',
                creatorName: 'Test Creator',
                creatorImage: '',
                packageId: 'test-package-1',
                packageName: 'Instagram Reel Package',
                packageDescription: 'Professional Instagram reel creation with trending music and effects',
                packagePrice: 2500,
                packageCurrency: 'INR',
                packageDuration: '3-5 days',
                platform: 'instagram',
                deliveryTime: 7,
                additionalInstructions: 'Make it trendy and engaging',
                references: ['brand-guidelines.pdf']
              });
              toast.success('Test package added to cart!');
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            🧪 Test Add to Cart
          </button>
        </div>
      </div>

      {/* Creators Grid */}
      {Object.values(filteredCreators).flat().length > 0 ? (
        <div className="space-y-8">
          {/* Display creators by platform using the grouped data directly */}
          {Object.entries(filteredCreators).map(([platform, platformCreators]) => (
            <PlatformCreatorSection
              key={platform}
              platform={platform}
              creators={platformCreators}
              onCreatorPress={(creator) => onViewCreatorProfile(creator.id, creator)}
              onViewAllPress={() => {
                // TODO: Navigate to platform-specific view all screen
                console.log(`View all ${platform} creators`);
              }}
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
