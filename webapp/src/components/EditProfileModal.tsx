'use client';

import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  ChevronRightIcon,
  XMarkIcon,
  PencilIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { cloudinaryService } from '@/services/cloudinaryService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  profile: any;
}

interface ProfileFormData {
  fullName: string;
  gender: string;
  state: string;
  city: string;
  pincode: string;
  languages: string[];
  email: string;
  phone: string;
  about: string;
  categories: string[];
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    gender: '',
    state: '',
    city: '',
    pincode: '',
    languages: [],
    email: '',
    phone: '',
    about: '',
    categories: []
  });

  const [expandedSections, setExpandedSections] = useState({
    personalDetails: true,
    emailMobile: false,
    aboutCategories: false
  });

  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [phoneOTP, setPhoneOTP] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(30);
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');

  const availableCategories = [
    'Lifestyle', 'Entertainment', 'Beauty', 'Gaming', 'Travel', 'Food',
    'Education', 'Pet', 'Sports & Fitness', 'Fashion', 'Bloggers/Vloggers',
    'Tech', 'Parenting', 'Photography', 'Healthcare', 'Virtual', 'Finance'
  ];

  const availableLanguages = [
    'Hindi', 'English', 'Telugu', 'Marathi', 'Gujarati', 'Bengali',
    'Tamil', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Arabic',
    'French', 'German', 'Spanish', 'Chinese', 'Japanese', 'Korean'
  ];

  const availableStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const availableCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
    'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        gender: profile.gender || '',
        state: profile.state || '',
        city: profile.city || '',
        pincode: profile.pincode || '',
        languages: profile.languages || [],
        email: profile.email || '',
        phone: profile.phone || '',
        about: profile.bio || '',
        categories: profile.content_categories || profile.categories || []
      });
      
      // Set existing image URLs
      if (profile.coverImage) setCoverImageUrl(profile.coverImage);
      if (profile.profilePicture) setProfileImageUrl(profile.profilePicture);
    }
  }, [profile]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailTimer > 0 && showEmailOTP) {
      interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer, showEmailOTP]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phoneTimer > 0 && showPhoneOTP) {
      interval = setInterval(() => {
        setPhoneTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer, showPhoneOTP]);

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageAdd = (language: string) => {
    if (language && !formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };

  const handleLanguageRemove = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(cat => cat !== category)
        };
      } else {
        if (prev.categories.length < 5) {
          return {
            ...prev,
            categories: [...prev.categories, category]
          };
        }
        return prev;
      }
    });
  };

  const handleEmailVerification = () => {
    setShowEmailOTP(true);
    setEmailTimer(30);
    // TODO: Implement actual email verification API call
  };

  const handlePhoneVerification = () => {
    setShowPhoneOTP(true);
    setPhoneTimer(30);
    // TODO: Implement actual phone verification API call
  };

  const handleEmailOTPChange = (index: number, value: string) => {
    const newOTP = [...emailOTP];
    newOTP[index] = value;
    setEmailOTP(newOTP);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`email-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePhoneOTPChange = (index: number, value: string) => {
    const newOTP = [...phoneOTP];
    newOTP[index] = value;
    setPhoneOTP(newOTP);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleEditCover = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        try {
          setCoverImage(target.files[0]);
          // Upload to Cloudinary
          const result = await cloudinaryService.uploadFile(target.files[0]);
          setCoverImageUrl(result.secure_url);
          console.log('Cover image uploaded to Cloudinary:', result.secure_url);
        } catch (error) {
          console.error('Failed to upload cover image:', error);
        }
      }
    };
    input.click();
  };

  const handleEditProfilePicture = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        try {
          setProfileImage(target.files[0]);
          // Upload to Cloudinary
          const result = await cloudinaryService.uploadFile(target.files[0]);
          setProfileImageUrl(result.secure_url);
          console.log('Profile image uploaded to Cloudinary:', result.secure_url);
        } catch (error) {
          console.error('Failed to upload profile image:', error);
        }
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      coverImage,
      profileImage,
      coverImageUrl,
      profileImageUrl
    };
    onSave(updatedData);
    onClose();
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

                {/* Profile Banner */}
        <div className="relative h-48 bg-orange-500 mx-6 mt-6 rounded-lg overflow-hidden">
          {coverImageUrl && (
            <img 
              src={coverImageUrl} 
              alt="Cover" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
              {formData.fullName ? `${formData.fullName.toUpperCase()} INFLUENCER` : 'CREATOR INFLUENCER'}
            </h1>
          </div>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <button 
                onClick={handleEditProfilePicture}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white"
              >
                <CameraIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          {/* Edit Cover Button */}
          <button 
            onClick={handleEditCover}
            className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Cover
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Personal Details Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('personalDetails')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
              {expandedSections.personalDetails ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-500 transform rotate-90" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.personalDetails && (
              <div className="px-6 pb-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>

                {/* State and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select City</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="Placeholder"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.languages.map((language) => (
                      <span
                        key={language}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {language}
                        <button
                          onClick={() => handleLanguageRemove(language)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => handleLanguageAdd(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Add Language</option>
                      {availableLanguages.filter(lang => !formData.languages.includes(lang)).map((language) => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email & Mobile Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('emailMobile')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Email & Mobile</h3>
              {expandedSections.emailMobile ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-500 transform rotate-90" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.emailMobile && (
              <div className="px-6 pb-6 space-y-6">
                {/* Email Section */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="e.g. azharweb90@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleEmailVerification}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors self-end"
                    >
                      Verify Email ID
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">We will send 6 digit code to your email ID to verify.</p>
                  
                  {/* Email OTP */}
                  {showEmailOTP && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        Enter OTP we just sent on your email ({formData.email})
                      </p>
                      <div className="flex gap-2">
                        {emailOTP.map((digit, index) => (
                          <input
                            key={index}
                            id={`email-otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleEmailOTPChange(index, e.target.value)}
                            className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Didn't receive the OTP?</span>
                        <span className="text-sm text-blue-600 cursor-pointer">Resend OTP</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">00:{emailTimer.toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Section */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Placeholder"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handlePhoneVerification}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors self-end"
                    >
                      Verify Phone Number
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">We will send you OTP on this mobile number to verify!</p>
                  
                  {/* Phone OTP */}
                  {showPhoneOTP && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        Enter OTP we just sent on your number (+91-{formData.phone})
                      </p>
                      <div className="flex gap-2">
                        {phoneOTP.map((digit, index) => (
                          <input
                            key={index}
                            id={`phone-otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePhoneOTPChange(index, e.target.value)}
                            className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Didn't receive the OTP?</span>
                        <span className="text-sm text-blue-600 cursor-pointer">Resend OTP</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">00:{phoneTimer.toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* About & Categories Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('aboutCategories')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">About & Categories</h3>
              {expandedSections.aboutCategories ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-500 transform rotate-90" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections.aboutCategories && (
              <div className="px-6 pb-6 space-y-6">
                {/* About Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    placeholder="Brief about your work so that it will help brands to connect you easily."
                    rows={4}
                    maxLength={250}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                  <div className="text-right mt-1">
                    <span className="text-sm text-gray-500">
                      {formData.about.length}/250
                    </span>
                  </div>
                </div>

                {/* Categories Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pick categories</label>
                  <p className="text-sm text-gray-500 mb-4">
                    Minimum one category and maximum five you can select.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          formData.categories.includes(category)
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
