'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MainNavigation from '@/components/navigation/MainNavigation';
import { 
  StarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function CreatorHome() {
  const router = useRouter();

  // Sample featured creators data
  const featuredCreators = [
    {
      id: 1,
      name: "Sarah Johnson",
      platform: "Instagram",
      followers: "2.5M",
      category: "Fashion & Lifestyle",
      image: "/assets/onboarding1.png",
      rating: 4.9,
      earnings: "₹45K/month"
    },
    {
      id: 2,
      name: "Mike Chen",
      platform: "YouTube",
      followers: "1.8M",
      category: "Tech Reviews",
      image: "/assets/onboarding1.png",
      rating: 4.8,
      earnings: "₹38K/month"
    },
    {
      id: 3,
      name: "Priya Sharma",
      platform: "TikTok",
      followers: "3.2M",
      category: "Dance & Fitness",
      image: "/assets/onboarding1.png",
      rating: 4.7,
      earnings: "₹52K/month"
    }
  ];

  // Sample trending campaigns
  const trendingCampaigns = [
    {
      id: 1,
      title: "Summer Fashion Collection",
      brand: "StyleHub",
      budget: "₹25K - ₹50K",
      platform: "Instagram",
      duration: "2 weeks",
      category: "Fashion"
    },
    {
      id: 2,
      title: "Tech Gadget Reviews",
      brand: "TechCorp",
      budget: "₹15K - ₹30K",
      platform: "YouTube",
      duration: "1 month",
      category: "Technology"
    },
    {
      id: 3,
      title: "Fitness Challenge",
      brand: "FitLife",
      budget: "₹20K - ₹40K",
      platform: "TikTok",
      duration: "3 weeks",
      category: "Health & Fitness"
    }
  ];

  // Sample success stories
  const successStories = [
    {
      id: 1,
      creator: "Alex Rodriguez",
      story: "Started with 10K followers, now earning ₹60K/month through brand collaborations",
      growth: "500%",
      image: "/assets/onboarding1.png"
    },
    {
      id: 2,
      creator: "Emma Wilson",
      story: "Built a community of 500K followers and launched my own product line",
      growth: "300%",
      image: "/assets/onboarding1.png"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MainNavigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Turn Your Passion Into Profit
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of creators who are earning money through brand collaborations. 
            Build your audience, create amazing content, and get paid for what you love.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push('/signup-creator')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Earning Today
            </button>
            <button 
              onClick={() => router.push('/signup-brand')}
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              I&apos;m a Brand
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">₹2.5Cr+</div>
              <div className="text-gray-600">Paid to Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Brand Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in just 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Sign up and showcase your content, audience, and expertise</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Discovered</h3>
              <p className="text-gray-600">Brands will find you and send collaboration requests</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Money</h3>
              <p className="text-gray-600">Complete campaigns and get paid for your content</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Creators</h2>
            <p className="text-xl text-gray-600">See how other creators are succeeding</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <Image 
                    src={creator.image} 
                    alt={creator.name} 
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    {creator.platform}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{creator.name}</h3>
                  <p className="text-gray-600 mb-3">{creator.category}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className="text-gray-700">{creator.rating}</span>
                    </div>
                    <span className="text-gray-500">{creator.followers} followers</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-semibold">{creator.earnings}</span>
                    <button className="text-orange-500 hover:text-orange-600 font-medium">
                      View Profile <ArrowRightIcon className="w-4 h-4 inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Campaigns */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Campaigns</h2>
            <p className="text-xl text-gray-600">High-paying opportunities waiting for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {campaign.category}
                  </span>
                  <span className="text-gray-500 text-sm">{campaign.duration}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-4">by {campaign.brand}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                    {campaign.platform}
                  </div>
                  <span className="text-green-600 font-semibold">{campaign.budget}</span>
                </div>
                
                <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Real creators, real results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story) => (
              <div key={story.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Image 
                    src={story.image} 
                    alt={story.creator} 
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{story.creator}</h3>
                    <p className="text-gray-600 mb-3">{story.story}</p>
                    <div className="flex items-center text-green-600 font-semibold">
                      <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                      {story.growth} growth
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Influmojo?</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed as a creator</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Higher Earnings</h3>
              <p className="text-gray-600">Get paid what you&apos;re worth with our fair pricing model</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Brands</h3>
              <p className="text-gray-600">Work with verified brands that respect creators</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">Track your performance and grow your audience</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RocketLaunchIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Payments</h3>
              <p className="text-gray-600">Get paid within 7 days of campaign completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-400 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Creator Journey?</h2>
          <p className="text-xl mb-8">
            Join thousands of creators who are already earning money through brand collaborations. 
            Your next big opportunity is just a click away.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push('/signup-creator')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Already Have Account?
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image 
                src="/assets/logo/Group.png" 
                alt="Influmojo" 
                width={120} 
                height={40}
                className="h-8 w-auto mb-4"
              />
              <p className="text-gray-400">
                Connecting creators with brands for meaningful collaborations.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Creators</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
                <li><a href="#" className="hover:text-white">Creator Resources</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Brands</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Find Creators</a></li>
                <li><a href="#" className="hover:text-white">Campaign Management</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Influmojo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
