'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CreatorPreferencesScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  const categories = [
    'Gaming', 'Travel', 'Food', 'Education', 'Pet', 'Beauty',
    'Sports & Fitness', 'Lifestyle', 'Entertainment', 'Fashion',
    'Bloggers / Vloggers', 'Tech', 'Parenting', 'Photography',
    'Healthcare', 'virtual', 'Finance'
  ];

  const availableLanguages = ['Hindi', 'English', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Tamil'];
  const availablePlatforms = ['Instagram', 'YouTube', 'Facebook', 'TikTok', 'Twitter', 'LinkedIn', 'Snapchat'];

  // Category selection logic
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, cat]);
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
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (!about.trim()) {
      alert('Please add a brief description about your work');
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
      console.log('Saving preferences:', {
        categories: selectedCategories,
        about: about.trim(),
        languages: selectedLanguages,
        platform: selectedPlatforms
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ Preferences saved successfully!');
      // Navigate to profile complete
      window.location.href = '/profile-complete';
    } catch (error) {
      console.error('Error saving preferences:', error);
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
          <Link href="/signup-brand" className="text-textDark font-poppins-medium hover:text-secondary transition-colors text-xs lg:text-sm">
            Sign up as brand
          </Link>
          <Link href="/signup-creator" className="text-secondary font-poppins-medium hover:text-opacity-80 transition-colors text-xs lg:text-sm">
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
              title="Get Started in Minutes"
              description="Quick profile setup for brands and influencers—no complex steps."
            />
            <Feature
              title="Trusted Campaigns & Creators"
              description="Join verified campaigns or find influencers that match your brand."
            />
            <Feature
              title="Online & Offline Collaborations"
              description="Brands can book packages or hire creators for in-person promos."
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

        {/* Right Side - Preferences Form */}
        <div className="w-full lg:w-1/2 px-3 sm:px-6 lg:pl-3 lg:pr-12 xl:pl-6 xl:pr-16 py-12 sm:py-16 lg:py-24 flex flex-col justify-center items-center lg:items-center">
          <div className="max-w-sm lg:max-w-md xl:max-w-lg w-full space-y-4 sm:space-y-6">
            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins-semibold text-textDark mb-2 sm:mb-3 text-left w-full tracking-wide lg:tracking-wider">
                Creator Preferences
              </h2>
              <p className="text-xs sm:text-sm text-textGray font-poppins-regular">
                Help brands understand your content style and reach the right audience.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-textGray font-poppins-regular text-center">75%</p>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Pick categories</label>
              <p className="text-xs text-textGray font-poppins-regular">
                Minimum one category and maximum five you can select.
              </p>
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3.5 py-1.5 rounded-[25px] text-sm font-poppins-regular transition-colors border ${
                        selectedCategories.includes(category)
                          ? 'bg-[#FFE7D5] border-[#FFE7DF] text-textDark'
                          : 'bg-[#F8F9FE] border-[#EEE] text-textDark hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">About</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Brief about your work so that it will help brands to connect you easily."
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg text-xs sm:text-sm font-poppins-regular text-textDark bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
                rows={4}
                maxLength={250}
              />
            </div>

            {/* Languages Section */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Languages</label>
              <p className="text-xs text-textGray font-poppins-regular">
                Select the languages you can create content in.
              </p>
              <div className="border border-gray-200 rounded-lg p-2 flex items-center">
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedLanguages.map((language) => (
                    <div
                      key={language}
                      className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg"
                    >
                      <span className="text-sm font-poppins-regular text-textDark">{language}</span>
                      <button
                        onClick={() => toggleLanguage(language)}
                        className="text-gray-500 hover:text-gray-700 transition-colors ml-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowLanguageModal(!showLanguageModal)}
                  className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 ml-2 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm text-textGray font-poppins-regular">
                    {selectedLanguages.length === 0 ? 'Select Languages' : `${selectedLanguages.length} selected`}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-textGray transition-transform ${showLanguageModal ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Language Dropdown */}
              {showLanguageModal && (
                <div className="border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden z-50 relative">
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="text-sm font-poppins-semibold text-textDark">Select Languages</h4>
                    <p className="text-xs text-textGray font-poppins-regular mt-1">Choose the languages you can create content in.</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableLanguages.map((language) => (
                      <label
                        key={language}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => toggleLanguage(language)}
                          className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary focus:ring-2"
                        />
                        <span className="text-sm font-poppins-regular text-textDark">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Platforms Section */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-poppins-semibold text-textDark">Platforms</label>
              <p className="text-xs text-textGray font-poppins-regular">
                Select the platforms you can create content on.
              </p>
              <div className="border border-gray-200 rounded-lg p-2 flex items-center">
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedPlatforms.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg"
                    >
                      <span className="text-sm font-poppins-regular text-textDark">{platform}</span>
                      <button
                        onClick={() => togglePlatform(platform)}
                        className="text-gray-500 hover:text-gray-700 transition-colors ml-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowPlatformModal(!showPlatformModal)}
                  className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 ml-2 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm text-textGray font-poppins-regular">
                    {selectedPlatforms.length === 0 ? 'Select Platforms' : `${selectedPlatforms.length} selected`}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-textGray transition-transform ${showPlatformModal ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Platform Dropdown */}
              {showPlatformModal && (
                <div className="border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden z-50 relative">
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="text-sm font-poppins-semibold text-textDark">Select Platforms</h4>
                    <p className="text-xs text-textGray font-poppins-regular mt-1">Choose the platforms you can create content on.</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availablePlatforms.map((platform) => (
                      <label
                        key={platform}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform)}
                          onChange={() => togglePlatform(platform)}
                          className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary focus:ring-2"
                        />
                        <span className="text-sm font-poppins-regular text-textDark">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Preferences Button */}
            <button
              onClick={handleSavePreferences}
              disabled={loading || selectedCategories.length === 0 || !about.trim() || selectedLanguages.length === 0 || selectedPlatforms.length === 0}
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

      {/* Modal Overlays */}
      {showLanguageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowLanguageModal(false)}
        />
      )}
      
      {showPlatformModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowPlatformModal(false)}
        />
      )}
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
