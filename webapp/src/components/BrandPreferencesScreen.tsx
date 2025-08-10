'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandPreferencesScreen() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  const industries = [
    'Fashion & Beauty', 'Food & Beverage', 'Technology', 'Healthcare', 'Education',
    'Travel & Tourism', 'Automotive', 'Finance', 'Real Estate', 'Entertainment',
    'Sports & Fitness', 'Home & Lifestyle', 'Pet Care', 'Gaming', 'E-commerce',
    'Professional Services', 'Non-profit', 'Government'
  ];

  const availableLanguages = ['Hindi', 'English', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Tamil'];
  const availablePlatforms = ['Instagram', 'YouTube', 'Facebook', 'TikTok', 'Twitter', 'LinkedIn', 'Snapchat'];

  // Industry selection logic
  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else if (selectedIndustries.length < 5) {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // Language selection logic
  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Platform selection logic
  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Save preferences to database
  const handleSavePreferences = async () => {
    if (selectedIndustries.length === 0) {
      alert('Please select at least one industry');
      return;
    }

    if (!about.trim()) {
      alert('Please add a brief description about your brand');
      return;
    }

    if (selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setLoading(true);
    try {
      // TODO: Save preferences to backend
      console.log('Saving brand preferences:', {
        industries: selectedIndustries,
        about: about.trim(),
        languages: selectedLanguages,
        platforms: selectedPlatforms
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ Brand preferences saved successfully!');
      // Navigate to profile complete
      window.location.href = '/profile-complete';
    } catch (error) {
      console.error('Error saving brand preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins-regular flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <img 
            src="/images/logo1.svg" 
            alt="im logo" 
            className="h-7 w-auto"
            onError={(e) => {
              console.error('Failed to load logo1.svg');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <img 
            src="/images/logo2.svg" 
            alt="influ mojo text" 
            className="h-7 w-auto"
            onError={(e) => {
              console.error('Failed to load logo2.svg');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
          <Link href="/how-it-works" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            How it works
          </Link>
          <Link href="/pricing" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Pricing
          </Link>
          <Link href="/signup-brand" className="text-secondary font-poppins-medium hover:text-opacity-80 transition-colors text-xs lg:text-sm">
            Sign up as brand
          </Link>
          <Link href="/signup-creator" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Sign up as Creator
          </Link>
          <Link href="/login" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Login
          </Link>
          {/* User Profile Icon - Man in suit */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-poppins-bold">👔</span>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 w-full bg-white">
        {/* Left Side - Features */}
        <div className="w-full lg:w-1/2 bg-[#FFF4ED] px-3 sm:px-6 lg:pl-12 lg:pr-3 xl:pl-16 xl:pr-6 py-12 sm:py-16 lg:py-24 flex flex-col justify-center items-center lg:items-center">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg w-full space-y-4 sm:space-y-6">
            <Feature
              title="Connect with the Right Creators"
              description="Find influencers that match your brand's industry and target audience."
            />
            <Feature
              title="Campaign Management"
              description="Create and manage influencer campaigns with detailed analytics."
            />
            <Feature
              title="Quality Assurance"
              description="Work with verified creators who deliver authentic content."
            />
          </div>
          <div className="flex items-center mt-6 sm:mt-8 max-w-sm lg:max-w-md xl:max-w-lg w-full">
            {/* Four overlapping circular profile images */}
            <div className="flex -space-x-[12px]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-yellow-300 flex-shrink-0">
                <Image 
                  src="/images/profile1.svg" 
                  alt="Profile 1" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                  }}
                />
              </div>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-yellow-300 flex-shrink-0">
                <Image 
                  src="/images/profile2.svg" 
                  alt="Profile 2" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-yellow-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                  }}
                />
              </div>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-blue-300 flex-shrink-0">
                <Image 
                  src="/images/profile3.svg" 
                  alt="Profile 3" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-blue-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                  }}
                />
              </div>
              
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex-shrink-0">
                <Image 
                  src="/images/profile4.svg" 
                  alt="Profile 4" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center flex-shrink-0';
                    target.parentElement!.innerHTML = '<span class="text-white text-xs font-poppins-bold">👤</span>';
                  }}
                />
              </div>
            </div>
            
            {/* Vertical separator line */}
            <div className="w-px h-6 sm:h-8 bg-textDark mx-2 sm:mx-3" />
            
            {/* Text content */}
            <div className="flex flex-col max-w-xs">
              <p className="text-[13px] font-poppins text-textDark leading-relaxed">
                Join 12,000+ influencers and 500+ brands already
              </p>
              <p className="text-[13px] font-poppins text-textDark leading-relaxed">
                building meaningful partnerships.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Brand Preferences Form */}
        <div className="w-full lg:w-1/2 px-3 sm:px-6 lg:pl-3 lg:pr-12 xl:pl-6 xl:pr-16 py-12 sm:py-16 lg:py-24 flex flex-col justify-center items-center lg:items-center">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg w-full space-y-4 sm:space-y-6">
            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins-semibold text-textDark mb-2 sm:mb-3 text-left w-full tracking-wide lg:tracking-wider">
                Tell us about your brand
              </h2>
              <p className="text-xs sm:text-sm text-textGray font-poppins-regular">
                Help us understand your brand better so we can connect you with the right creators for your campaigns.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-textGray font-poppins-regular text-center">75%</p>

            {/* Industry Selection */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">
                Industry (Select up to 5)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => toggleIndustry(industry)}
                    className={`p-3 text-xs sm:text-sm font-poppins-regular rounded-lg border transition-all ${
                      selectedIndustries.includes(industry)
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-300 bg-white text-textDark hover:border-secondary hover:bg-secondary hover:text-white'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* About Brand */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">
                About your brand
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about your brand, products, and what you're looking for in creators..."
                rows={4}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-xs sm:text-sm font-poppins-regular text-textDark bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">
                Languages (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableLanguages.map((language) => (
                  <button
                    key={language}
                    onClick={() => toggleLanguage(language)}
                    className={`p-3 text-xs sm:text-sm font-poppins-regular rounded-lg border transition-all ${
                      selectedLanguages.includes(language)
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-300 bg-white text-textDark hover:border-secondary hover:bg-secondary hover:text-white'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">
                Platforms (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`p-3 text-xs sm:text-sm font-poppins-regular rounded-lg border transition-all ${
                      selectedPlatforms.includes(platform)
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-300 bg-white text-textDark hover:border-secondary hover:bg-secondary hover:text-white'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Preferences Button */}
            <button
              onClick={handleSavePreferences}
              disabled={loading || selectedIndustries.length === 0 || !about.trim() || selectedLanguages.length === 0 || selectedPlatforms.length === 0}
              className="w-full py-2.5 text-white text-sm font-poppins-semibold rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              style={{ background: 'linear-gradient(180deg, #FE8F00, #FC5213)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  Save Preferences
                  <Image src="/icons/arrow.svg" alt="arrow" width={14} height={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Feature = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start space-x-2">
    {/* Orange checkmark icon inside circle */}
    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg width="8" height="8" className="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
      </svg>
    </div>
    <div>
      {/* Feature title - using Poppins SemiBold like mobile */}
      <h3 className="text-sm sm:text-base lg:text-lg font-poppins-semibold text-textDark mb-1">{title}</h3>
      {/* Feature description - using Poppins Regular like mobile */}
      <p className="text-xs sm:text-sm lg:text-base font-poppins-regular text-textLight leading-relaxed">{description}</p>
    </div>
  </div>
);
