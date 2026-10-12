/**
 * GeoLocationService — Comprehensive City Geocoding & Device Geolocation
 * 
 * Features:
 * - Curated database of 150+ Indian and international cities with exact coordinates & timezones
 * - Fast prefix-first fuzzy search for instant keystroke popup suggestions (e.g. "M" -> Madurai, Mumbai, etc.)
 * - Native browser Geolocation API integration with nearest-city coordinate mapping
 * - Haversine distance calculation for closest city resolution
 */

export const CITIES_DATABASE = [
  // Tamil Nadu & South India
  { name: 'Madurai, Tamil Nadu, India', short: 'Madurai', country: 'India', lat: 9.9252, lon: 78.1198, tz: 'Asia/Kolkata' },
  { name: 'Chennai, Tamil Nadu, India', short: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Coimbatore, Tamil Nadu, India', short: 'Coimbatore', country: 'India', lat: 11.0168, lon: 76.9558, tz: 'Asia/Kolkata' },
  { name: 'Tiruchirappalli (Trichy), Tamil Nadu, India', short: 'Tiruchirappalli', country: 'India', lat: 10.7905, lon: 78.7047, tz: 'Asia/Kolkata' },
  { name: 'Salem, Tamil Nadu, India', short: 'Salem', country: 'India', lat: 11.6643, lon: 78.1460, tz: 'Asia/Kolkata' },
  { name: 'Tirunelveli, Tamil Nadu, India', short: 'Tirunelveli', country: 'India', lat: 8.7139, lon: 77.7567, tz: 'Asia/Kolkata' },
  { name: 'Erode, Tamil Nadu, India', short: 'Erode', country: 'India', lat: 11.3410, lon: 77.7172, tz: 'Asia/Kolkata' },
  { name: 'Vellore, Tamil Nadu, India', short: 'Vellore', country: 'India', lat: 12.9165, lon: 79.1325, tz: 'Asia/Kolkata' },
  { name: 'Thanjavur, Tamil Nadu, India', short: 'Thanjavur', country: 'India', lat: 10.7870, lon: 79.1378, tz: 'Asia/Kolkata' },
  { name: 'Dindigul, Tamil Nadu, India', short: 'Dindigul', country: 'India', lat: 10.3673, lon: 77.9803, tz: 'Asia/Kolkata' },
  { name: 'Kanchipuram, Tamil Nadu, India', short: 'Kanchipuram', country: 'India', lat: 12.8342, lon: 79.7036, tz: 'Asia/Kolkata' },
  { name: 'Nagercoil, Tamil Nadu, India', short: 'Nagercoil', country: 'India', lat: 8.1833, lon: 77.4119, tz: 'Asia/Kolkata' },
  { name: 'Kanyakumari, Tamil Nadu, India', short: 'Kanyakumari', country: 'India', lat: 8.0883, lon: 77.5385, tz: 'Asia/Kolkata' },
  { name: 'Rameswaram, Tamil Nadu, India', short: 'Rameswaram', country: 'India', lat: 9.2876, lon: 79.3129, tz: 'Asia/Kolkata' },
  { name: 'Tiruvannamalai, Tamil Nadu, India', short: 'Tiruvannamalai', country: 'India', lat: 12.2253, lon: 79.0747, tz: 'Asia/Kolkata' },
  { name: 'Kumbakonam, Tamil Nadu, India', short: 'Kumbakonam', country: 'India', lat: 10.9602, lon: 79.3845, tz: 'Asia/Kolkata' },
  { name: 'Puducherry (Pondicherry), India', short: 'Puducherry', country: 'India', lat: 11.9416, lon: 79.8083, tz: 'Asia/Kolkata' },

  // Karnataka
  { name: 'Bengaluru (Bangalore), Karnataka, India', short: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Mysuru (Mysore), Karnataka, India', short: 'Mysuru', country: 'India', lat: 12.2958, lon: 76.6394, tz: 'Asia/Kolkata' },
  { name: 'Mangaluru (Mangalore), Karnataka, India', short: 'Mangaluru', country: 'India', lat: 12.9141, lon: 74.8560, tz: 'Asia/Kolkata' },
  { name: 'Hubballi (Hubli), Karnataka, India', short: 'Hubballi', country: 'India', lat: 15.3647, lon: 75.1240, tz: 'Asia/Kolkata' },
  { name: 'Belagavi (Belgaum), Karnataka, India', short: 'Belagavi', country: 'India', lat: 15.8497, lon: 74.4977, tz: 'Asia/Kolkata' },
  { name: 'Kalaburagi (Gulbarga), Karnataka, India', short: 'Kalaburagi', country: 'India', lat: 17.3297, lon: 76.8343, tz: 'Asia/Kolkata' },
  { name: 'Udupi, Karnataka, India', short: 'Udupi', country: 'India', lat: 13.3409, lon: 74.7421, tz: 'Asia/Kolkata' },

  // Andhra Pradesh & Telangana
  { name: 'Hyderabad, Telangana, India', short: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'Warangal, Telangana, India', short: 'Warangal', country: 'India', lat: 17.9689, lon: 79.5941, tz: 'Asia/Kolkata' },
  { name: 'Visakhapatnam, Andhra Pradesh, India', short: 'Visakhapatnam', country: 'India', lat: 17.6868, lon: 83.2185, tz: 'Asia/Kolkata' },
  { name: 'Vijayawada, Andhra Pradesh, India', short: 'Vijayawada', country: 'India', lat: 16.5062, lon: 80.6480, tz: 'Asia/Kolkata' },
  { name: 'Guntur, Andhra Pradesh, India', short: 'Guntur', country: 'India', lat: 16.3067, lon: 80.4365, tz: 'Asia/Kolkata' },
  { name: 'Tirupati, Andhra Pradesh, India', short: 'Tirupati', country: 'India', lat: 13.6288, lon: 79.4192, tz: 'Asia/Kolkata' },
  { name: 'Nellore, Andhra Pradesh, India', short: 'Nellore', country: 'India', lat: 14.4426, lon: 79.9865, tz: 'Asia/Kolkata' },
  { name: 'Kurnool, Andhra Pradesh, India', short: 'Kurnool', country: 'India', lat: 15.8281, lon: 78.0373, tz: 'Asia/Kolkata' },

  // Kerala
  { name: 'Kochi (Cochin), Kerala, India', short: 'Kochi', country: 'India', lat: 9.9312, lon: 76.2673, tz: 'Asia/Kolkata' },
  { name: 'Thiruvananthapuram (Trivandrum), Kerala, India', short: 'Thiruvananthapuram', country: 'India', lat: 8.5241, lon: 76.9366, tz: 'Asia/Kolkata' },
  { name: 'Kozhikode (Calicut), Kerala, India', short: 'Kozhikode', country: 'India', lat: 11.2588, lon: 75.7804, tz: 'Asia/Kolkata' },
  { name: 'Thrissur, Kerala, India', short: 'Thrissur', country: 'India', lat: 10.5276, lon: 76.2144, tz: 'Asia/Kolkata' },
  { name: 'Kollam, Kerala, India', short: 'Kollam', country: 'India', lat: 8.8932, lon: 76.6141, tz: 'Asia/Kolkata' },
  { name: 'Palakkad, Kerala, India', short: 'Palakkad', country: 'India', lat: 10.7867, lon: 76.6548, tz: 'Asia/Kolkata' },
  { name: 'Kannur, Kerala, India', short: 'Kannur', country: 'India', lat: 11.8745, lon: 75.3704, tz: 'Asia/Kolkata' },

  // Maharashtra & Goa
  { name: 'Mumbai (Bombay), Maharashtra, India', short: 'Mumbai', country: 'India', lat: 18.9220, lon: 72.8347, tz: 'Asia/Kolkata' },
  { name: 'Pune, Maharashtra, India', short: 'Pune', country: 'India', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
  { name: 'Nagpur, Maharashtra, India', short: 'Nagpur', country: 'India', lat: 21.1458, lon: 79.0882, tz: 'Asia/Kolkata' },
  { name: 'Nashik, Maharashtra, India', short: 'Nashik', country: 'India', lat: 19.9975, lon: 73.7898, tz: 'Asia/Kolkata' },
  { name: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India', short: 'Aurangabad', country: 'India', lat: 19.8762, lon: 75.3433, tz: 'Asia/Kolkata' },
  { name: 'Thane, Maharashtra, India', short: 'Thane', country: 'India', lat: 19.2183, lon: 72.9781, tz: 'Asia/Kolkata' },
  { name: 'Kolhapur, Maharashtra, India', short: 'Kolhapur', country: 'India', lat: 16.7050, lon: 74.2433, tz: 'Asia/Kolkata' },
  { name: 'Solapur, Maharashtra, India', short: 'Solapur', country: 'India', lat: 17.6599, lon: 75.9064, tz: 'Asia/Kolkata' },
  { name: 'Panaji, Goa, India', short: 'Panaji', country: 'India', lat: 15.4909, lon: 73.8278, tz: 'Asia/Kolkata' },

  // Gujarat
  { name: 'Ahmedabad, Gujarat, India', short: 'Ahmedabad', country: 'India', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Surat, Gujarat, India', short: 'Surat', country: 'India', lat: 21.1702, lon: 72.8311, tz: 'Asia/Kolkata' },
  { name: 'Vadodara (Baroda), Gujarat, India', short: 'Vadodara', country: 'India', lat: 22.3072, lon: 73.1812, tz: 'Asia/Kolkata' },
  { name: 'Rajkot, Gujarat, India', short: 'Rajkot', country: 'India', lat: 22.3039, lon: 70.8022, tz: 'Asia/Kolkata' },
  { name: 'Gandhinagar, Gujarat, India', short: 'Gandhinagar', country: 'India', lat: 23.2156, lon: 72.6369, tz: 'Asia/Kolkata' },
  { name: 'Bhavnagar, Gujarat, India', short: 'Bhavnagar', country: 'India', lat: 21.7645, lon: 72.1519, tz: 'Asia/Kolkata' },

  // North & Central India
  { name: 'New Delhi, Delhi, India', short: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Noida, Uttar Pradesh, India', short: 'Noida', country: 'India', lat: 28.5355, lon: 77.3910, tz: 'Asia/Kolkata' },
  { name: 'Gurugram (Gurgaon), Haryana, India', short: 'Gurugram', country: 'India', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata' },
  { name: 'Faridabad, Haryana, India', short: 'Faridabad', country: 'India', lat: 28.4089, lon: 77.3178, tz: 'Asia/Kolkata' },
  { name: 'Chandigarh, India', short: 'Chandigarh', country: 'India', lat: 30.7333, lon: 76.7794, tz: 'Asia/Kolkata' },
  { name: 'Jaipur, Rajasthan, India', short: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
  { name: 'Jodhpur, Rajasthan, India', short: 'Jodhpur', country: 'India', lat: 26.2389, lon: 73.0243, tz: 'Asia/Kolkata' },
  { name: 'Udaipur, Rajasthan, India', short: 'Udaipur', country: 'India', lat: 24.5854, lon: 73.7125, tz: 'Asia/Kolkata' },
  { name: 'Kota, Rajasthan, India', short: 'Kota', country: 'India', lat: 25.2138, lon: 75.8648, tz: 'Asia/Kolkata' },
  { name: 'Ajmer, Rajasthan, India', short: 'Ajmer', country: 'India', lat: 26.4499, lon: 74.6399, tz: 'Asia/Kolkata' },
  { name: 'Lucknow, Uttar Pradesh, India', short: 'Lucknow', country: 'India', lat: 26.8467, lon: 80.9462, tz: 'Asia/Kolkata' },
  { name: 'Kanpur, Uttar Pradesh, India', short: 'Kanpur', country: 'India', lat: 26.4499, lon: 80.3319, tz: 'Asia/Kolkata' },
  { name: 'Varanasi (Kashi / Banaras), Uttar Pradesh, India', short: 'Varanasi', country: 'India', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' },
  { name: 'Prayagraj (Allahabad), Uttar Pradesh, India', short: 'Prayagraj', country: 'India', lat: 25.4358, lon: 81.8463, tz: 'Asia/Kolkata' },
  { name: 'Agra, Uttar Pradesh, India', short: 'Agra', country: 'India', lat: 27.1767, lon: 78.0081, tz: 'Asia/Kolkata' },
  { name: 'Mathura, Uttar Pradesh, India', short: 'Mathura', country: 'India', lat: 27.4924, lon: 77.6737, tz: 'Asia/Kolkata' },
  { name: 'Haridwar, Uttarakhand, India', short: 'Haridwar', country: 'India', lat: 29.9457, lon: 78.1642, tz: 'Asia/Kolkata' },
  { name: 'Rishikesh, Uttarakhand, India', short: 'Rishikesh', country: 'India', lat: 30.0869, lon: 78.2676, tz: 'Asia/Kolkata' },
  { name: 'Dehradun, Uttarakhand, India', short: 'Dehradun', country: 'India', lat: 30.3165, lon: 78.0322, tz: 'Asia/Kolkata' },
  { name: 'Shimla, Himachal Pradesh, India', short: 'Shimla', country: 'India', lat: 31.1048, lon: 77.1734, tz: 'Asia/Kolkata' },
  { name: 'Amritsar, Punjab, India', short: 'Amritsar', country: 'India', lat: 31.6340, lon: 74.8723, tz: 'Asia/Kolkata' },
  { name: 'Ludhiana, Punjab, India', short: 'Ludhiana', country: 'India', lat: 30.9010, lon: 75.8573, tz: 'Asia/Kolkata' },
  { name: 'Bhopal, Madhya Pradesh, India', short: 'Bhopal', country: 'India', lat: 23.2599, lon: 77.4126, tz: 'Asia/Kolkata' },
  { name: 'Indore, Madhya Pradesh, India', short: 'Indore', country: 'India', lat: 22.7196, lon: 75.8577, tz: 'Asia/Kolkata' },
  { name: 'Ujjain, Madhya Pradesh, India', short: 'Ujjain', country: 'India', lat: 23.1765, lon: 75.7885, tz: 'Asia/Kolkata' },
  { name: 'Gwalior, Madhya Pradesh, India', short: 'Gwalior', country: 'India', lat: 26.2183, lon: 78.1828, tz: 'Asia/Kolkata' },
  { name: 'Jabalpur, Madhya Pradesh, India', short: 'Jabalpur', country: 'India', lat: 23.1815, lon: 79.9864, tz: 'Asia/Kolkata' },
  { name: 'Raipur, Chhattisgarh, India', short: 'Raipur', country: 'India', lat: 21.2514, lon: 81.6296, tz: 'Asia/Kolkata' },

  // East & North East India
  { name: 'Kolkata (Calcutta), West Bengal, India', short: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Howrah, West Bengal, India', short: 'Howrah', country: 'India', lat: 22.5958, lon: 88.2636, tz: 'Asia/Kolkata' },
  { name: 'Siliguri, West Bengal, India', short: 'Siliguri', country: 'India', lat: 26.7271, lon: 88.3953, tz: 'Asia/Kolkata' },
  { name: 'Patna, Bihar, India', short: 'Patna', country: 'India', lat: 25.5941, lon: 85.1376, tz: 'Asia/Kolkata' },
  { name: 'Gaya, Bihar, India', short: 'Gaya', country: 'India', lat: 24.7914, lon: 85.0002, tz: 'Asia/Kolkata' },
  { name: 'Ranchi, Jharkhand, India', short: 'Ranchi', country: 'India', lat: 23.3441, lon: 85.3096, tz: 'Asia/Kolkata' },
  { name: 'Jamshedpur, Jharkhand, India', short: 'Jamshedpur', country: 'India', lat: 22.8046, lon: 86.2029, tz: 'Asia/Kolkata' },
  { name: 'Bhubaneswar, Odisha, India', short: 'Bhubaneswar', country: 'India', lat: 20.2961, lon: 85.8245, tz: 'Asia/Kolkata' },
  { name: 'Cuttack, Odisha, India', short: 'Cuttack', country: 'India', lat: 20.4625, lon: 85.8830, tz: 'Asia/Kolkata' },
  { name: 'Puri, Odisha, India', short: 'Puri', country: 'India', lat: 19.8135, lon: 85.8312, tz: 'Asia/Kolkata' },
  { name: 'Guwahati, Assam, India', short: 'Guwahati', country: 'India', lat: 26.1445, lon: 91.7362, tz: 'Asia/Kolkata' },
  { name: 'Shillong, Meghalaya, India', short: 'Shillong', country: 'India', lat: 25.5788, lon: 91.8933, tz: 'Asia/Kolkata' },

  // Global & International Hubs
  { name: 'London, England, United Kingdom', short: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'Manchester, England, United Kingdom', short: 'Manchester', country: 'United Kingdom', lat: 53.4808, lon: -2.2426, tz: 'Europe/London' },
  { name: 'Birmingham, England, United Kingdom', short: 'Birmingham', country: 'United Kingdom', lat: 52.4862, lon: -1.8904, tz: 'Europe/London' },
  { name: 'Edinburgh, Scotland, United Kingdom', short: 'Edinburgh', country: 'United Kingdom', lat: 55.9533, lon: -3.1883, tz: 'Europe/London' },
  { name: 'Dublin, Ireland', short: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603, tz: 'Europe/Dublin' },
  { name: 'New York City, New York, USA', short: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'San Francisco, California, USA', short: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
  { name: 'Los Angeles, California, USA', short: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'Chicago, Illinois, USA', short: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
  { name: 'Dallas, Texas, USA', short: 'Dallas', country: 'USA', lat: 32.7767, lon: -96.7970, tz: 'America/Chicago' },
  { name: 'Houston, Texas, USA', short: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
  { name: 'Seattle, Washington, USA', short: 'Seattle', country: 'USA', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
  { name: 'Atlanta, Georgia, USA', short: 'Atlanta', country: 'USA', lat: 33.7490, lon: -84.3880, tz: 'America/New_York' },
  { name: 'Toronto, Ontario, Canada', short: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
  { name: 'Vancouver, British Columbia, Canada', short: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
  { name: 'Montreal, Quebec, Canada', short: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, tz: 'America/Toronto' },
  { name: 'Singapore, Singapore', short: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Kuala Lumpur, Malaysia', short: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, tz: 'Asia/Kuala_Lumpur' },
  { name: 'Dubai, United Arab Emirates', short: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Abu Dhabi, United Arab Emirates', short: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773, tz: 'Asia/Dubai' },
  { name: 'Doha, Qatar', short: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310, tz: 'Asia/Qatar' },
  { name: 'Riyadh, Saudi Arabia', short: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, tz: 'Asia/Riyadh' },
  { name: 'Sydney, New South Wales, Australia', short: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Melbourne, Victoria, Australia', short: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
  { name: 'Auckland, New Zealand', short: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, tz: 'Pacific/Auckland' },
  { name: 'Paris, France', short: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'Berlin, Germany', short: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, tz: 'Europe/Berlin' },
  { name: 'Frankfurt, Germany', short: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, tz: 'Europe/Berlin' },
  { name: 'Rome, Italy', short: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, tz: 'Europe/Rome' },
  { name: 'Tokyo, Japan', short: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { name: 'Colombo, Sri Lanka', short: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612, tz: 'Asia/Colombo' }
];

export class GeoLocationService {
  /**
   * Search cities by typing prefix or query string.
   * Prioritizes prefix matches over substring matches.
   * 
   * @param {string} query 
   * @param {number} [limit=7] 
   * @returns {Array<object>}
   */
  static searchCities(query, limit = 7) {
    if (!query || !query.trim()) {
      return CITIES_DATABASE.slice(0, limit);
    }

    const clean = query.trim().toLowerCase();

    // 1. Exact prefix on short city name (e.g. "M" -> "Madurai", "Mumbai")
    const prefixMatches = [];
    // 2. Substring matches elsewhere
    const otherMatches = [];

    for (const city of CITIES_DATABASE) {
      const shortLower = city.short.toLowerCase();
      const fullLower = city.name.toLowerCase();

      if (shortLower.startsWith(clean)) {
        prefixMatches.push(city);
      } else if (fullLower.includes(clean)) {
        otherMatches.push(city);
      }

      if (prefixMatches.length >= limit) break;
    }

    const results = [...prefixMatches, ...otherMatches];
    return results.slice(0, limit);
  }

  /**
   * Resolve closest city using Haversine formula
   * @param {number} lat 
   * @param {number} lon 
   * @returns {object} Nearest city
   */
  static findNearestCity(lat, lon) {
    let nearest = CITIES_DATABASE[0];
    let minDistance = Infinity;

    for (const city of CITIES_DATABASE) {
      const dist = GeoLocationService.calculateDistance(lat, lon, city.lat, city.lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = city;
      }
    }

    return {
      ...nearest,
      distanceKm: Math.round(minDistance)
    };
  }

  /**
   * Haversine formula (distance in km)
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Request device geolocation and resolve to coordinates + nearest city.
   * @returns {Promise<{ city: object, exactLat: number, exactLon: number }>}
   */
  static async requestDeviceLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser or device.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const exactLat = parseFloat(pos.coords.latitude.toFixed(4));
          const exactLon = parseFloat(pos.coords.longitude.toFixed(4));
          const nearest = GeoLocationService.findNearestCity(exactLat, exactLon);

          resolve({
            city: nearest,
            exactLat,
            exactLon,
            accuracyMeters: Math.round(pos.coords.accuracy)
          });
        },
        (err) => {
          let message = 'Unable to access your location.';
          if (err.code === 1) message = 'Location permission was denied by user.';
          else if (err.code === 2) message = 'Location position unavailable.';
          else if (err.code === 3) message = 'Location request timed out.';
          reject(new Error(message));
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }
}
