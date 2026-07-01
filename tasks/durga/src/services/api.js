import axios from 'axios';

// Helper to calculate great-circle distance between two points using the Haversine formula
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
  
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance; // returns distance in km
}

// Check if an IP address is a private/local IP
export function isPrivateIP(ip) {
  if (!ip) return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false; // Basic IPv4 check
  
  const p1 = parseInt(parts[0], 10);
  const p2 = parseInt(parts[1], 10);
  
  // Localhost
  if (ip === '127.0.0.1' || ip === 'localhost') return true;
  // Class A private: 10.0.0.0 – 10.255.255.255
  if (p1 === 10) return true;
  // Class B private: 172.16.0.0 – 172.31.255.255
  if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
  // Class C private: 192.168.0.0 – 192.168.255.255
  if (p1 === 192 && p2 === 168) return true;
  // Link-local: 169.254.0.0 - 169.254.255.255
  if (p1 === 169 && p2 === 254) return true;
  
  return false;
}

// Fetch client IP
export async function fetchUserIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching client IP:', error);
    throw new Error('Failed to auto-detect public IP. Please input it manually.');
  }
}

// Geocode IP address via ipwho.is (HTTPS and free)
export async function fetchIPDetails(ip) {
  const cleanIP = ip.trim();
  
  if (isPrivateIP(cleanIP)) {
    throw new Error(`IP "${cleanIP}" is a private local network address and cannot be geolocated. Please enter a public IP address.`);
  }

  try {
    const url = `https://ipwho.is/${cleanIP}`;
    const response = await axios.get(url);
    
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Invalid IP address or geolocation failed.');
    }
    
    const d = response.data;
    
    // Map ipwho.is structure to match the old ip-api.com structure exactly
    // so no other components have to change!
    return {
      query: d.ip,
      status: 'success',
      city: d.city || 'Unknown',
      regionName: d.region || '',
      country: d.country || 'Unknown',
      countryCode: d.country_code || '',
      zip: d.postal || '',
      lat: d.latitude,
      lon: d.longitude,
      timezone: d.timezone?.id || 'UTC',
      isp: d.connection?.isp || 'Unknown',
      org: d.connection?.org || '',
      as: d.connection?.asn ? `AS${d.connection.asn}` : '',
      proxy: d.security?.proxy || d.security?.vpn || false,
      hosting: d.security?.hosting || false,
      mobile: d.security?.anonymous || false
    };
  } catch (error) {
    console.error(`Error geolocating IP ${cleanIP}:`, error);
    throw new Error(error.message || `Failed to fetch geolocation for IP ${cleanIP}.`);
  }
}

// Fetch current weather from Open-Meteo
export async function fetchWeatherDetails(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const response = await axios.get(url);
    return response.data.current;
  } catch (error) {
    console.error(`Error fetching weather for coordinates (${lat}, ${lon}):`, error);
    throw new Error('Failed to fetch weather data.');
  }
}

// Map WMO weather codes
export function interpretWeatherCode(code) {
  const codes = {
    0: { label: 'Clear Sky', icon: 'WiClearSky' },
    1: { label: 'Mainly Clear', icon: 'WiMainlyClear' },
    2: { label: 'Partly Cloudy', icon: 'WiPartlyCloudy' },
    3: { label: 'Overcast', icon: 'WiOvercast' },
    45: { label: 'Fog', icon: 'WiFog' },
    48: { label: 'Depositing Rime Fog', icon: 'WiFog' },
    51: { label: 'Light Drizzle', icon: 'WiDrizzle' },
    53: { label: 'Moderate Drizzle', icon: 'WiDrizzle' },
    55: { label: 'Dense Drizzle', icon: 'WiDrizzle' },
    56: { label: 'Light Freezing Drizzle', icon: 'WiDrizzle' },
    57: { label: 'Dense Freezing Drizzle', icon: 'WiDrizzle' },
    61: { label: 'Slight Rain', icon: 'WiRain' },
    63: { label: 'Moderate Rain', icon: 'WiRain' },
    65: { label: 'Heavy Rain', icon: 'WiRain' },
    66: { label: 'Light Freezing Rain', icon: 'WiRain' },
    67: { label: 'Heavy Freezing Rain', icon: 'WiRain' },
    71: { label: 'Slight Snow Fall', icon: 'WiSnow' },
    73: { label: 'Moderate Snow Fall', icon: 'WiSnow' },
    75: { label: 'Heavy Snow Fall', icon: 'WiSnow' },
    77: { label: 'Snow Grains', icon: 'WiSnow' },
    80: { label: 'Slight Rain Showers', icon: 'WiRainShowers' },
    81: { label: 'Moderate Rain Showers', icon: 'WiRainShowers' },
    82: { label: 'Violent Rain Showers', icon: 'WiRainShowers' },
    85: { label: 'Slight Snow Showers', icon: 'WiSnowShowers' },
    86: { label: 'Heavy Snow Showers', icon: 'WiSnowShowers' },
    95: { label: 'Thunderstorm', icon: 'WiThunderstorm' },
    96: { label: 'Thunderstorm with Slight Hail', icon: 'WiThunderstorm' },
    99: { label: 'Thunderstorm with Heavy Hail', icon: 'WiThunderstorm' }
  };
  return codes[code] || { label: 'Unknown Conditions', icon: 'WiCloudy' };
}
