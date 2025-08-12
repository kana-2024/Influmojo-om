'use client';

import { useState, useMemo } from 'react';

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  selectedCity?: string;
}

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 
  'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 
  'Amritsar', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 
  'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 
  'Solapur', 'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 
  'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Saharanpur', 
  'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 
  'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 
  'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Jamnagar', 'Ujjain', 'Siliguri',
  'Jhansi', 'Jammu', 'Mangalore', 'Erode', 'Belgaum', 'Tirunelveli', 'Gaya', 'Jalgaon', 
  'Udaipur', 'Tirupur', 'Kozhikode', 'Kurnool', 'Bokaro', 'Bellary', 'Patiala', 
  'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Latur', 'Dhule', 'Rohtak', 'Korba',
  'Bhilwara', 'Brahmapur', 'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Kadapa', 
  'Bilaspur', 'Satara', 'Bijapur', 'Rampur', 'Shivamogga', 'Chandrapur', 'Junagadh', 
  'Thrissur', 'Alwar', 'Bardhaman', 'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 
  'Tumkur', 'Hisar', 'Bihar Sharif', 'Panipat', 'Darbhanga', 'Aizawl', 'Dewas', 
  'Tirupati', 'Karnal', 'Bathinda', 'Shivpuri', 'Ratlam', 'Modinagar', 'Pali', 
  'Ramagundam', 'Silchar', 'Haridwar', 'Vijayanagaram', 'Katihar', 'Nagercoil',
  'Thanjavur', 'Hajipur', 'Sasaram', 'Hospet', 'Vellore', 'Mirzapur', 'Secunderabad', 
  'Pudukkottai', 'Shimla', 'Bharatpur', 'Sonipat', 'Farrukhabad', 'Sagar', 'Durg', 
  'Imphal', 'Hapur', 'Arrah', 'Karimnagar', 'Anantapur', 'Etawah', 'Ambernath', 
  'Begusarai', 'New Delhi', 'Chhapra', 'Satna', 'Vizianagaram', 'Hardwar', 'Proddatur', 
  'Machilipatnam', 'Bettiah', 'Purulia', 'Hassan', 'Baidyabati', 'Raigarh', 'Adra', 
  'Bhusawal', 'Bahraich', 'Vasco da Gama', 'Vapi'
];

const CityModal: React.FC<CityModalProps> = ({ visible, onClose, onSelectCity, selectedCity }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return CITIES;
    }
    return CITIES.filter(city => 
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-textDark flex-1 text-center">Select City</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-textDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-[#20536d] rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {searchQuery.length > 0 && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* City List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCities.map(city => (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <span className={`text-base ${
                  selectedCity === city 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-textDark font-normal'
                }`}>
                  {city}
                </span>
                {selectedCity === city && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CityModal;
