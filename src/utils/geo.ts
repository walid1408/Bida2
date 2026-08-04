// Geolocation utilities for Algerian cities and Haversine distance calculation

export interface Coordinates {
  lat: number;
  lng: number;
}

// Map of Algerian Wilayas to approximate central coordinates (latitude, longitude)
export const WILAYA_COORDINATES: Record<string, Coordinates> = {
  'Alger': { lat: 36.7538, lng: 3.0588 },
  'Oran': { lat: 35.6971, lng: -0.6308 },
  'Constantine': { lat: 36.3650, lng: 6.6147 },
  'Annaba': { lat: 36.9000, lng: 7.7667 },
  'Blida': { lat: 36.4700, lng: 2.8300 },
  'Batna': { lat: 35.5559, lng: 6.1743 },
  'Djelfa': { lat: 34.6728, lng: 3.2630 },
  'Sétif': { lat: 36.1911, lng: 5.4137 },
  'Sidi Bel Abbès': { lat: 35.1899, lng: -0.6308 },
  'Biskra': { lat: 34.8503, lng: 5.7281 },
  'Tébessa': { lat: 35.4042, lng: 8.1242 },
  'El Oued': { lat: 33.3683, lng: 6.8674 },
  'Skikda': { lat: 36.8792, lng: 6.9039 },
  'Tiaret': { lat: 35.3710, lng: 1.3170 },
  'Béjaïa': { lat: 36.7509, lng: 5.0567 },
  'Tlemcen': { lat: 34.8783, lng: -1.3150 },
  'Ouargla': { lat: 31.9493, lng: 5.3250 },
  'Mostaganem': { lat: 35.9333, lng: 0.0903 },
  'Bordj Bou Arreridj': { lat: 36.0732, lng: 4.7611 },
  'Chlef': { lat: 36.1653, lng: 1.3347 },
  'Souk Ahras': { lat: 36.2864, lng: 7.9511 },
  'M\'Sila': { lat: 35.7058, lng: 4.5419 },
  'Jijel': { lat: 36.8205, lng: 5.7667 },
  'Ghardaïa': { lat: 32.4909, lng: 3.6733 },
  'Saïda': { lat: 34.8303, lng: 0.1517 },
  'Guelma': { lat: 36.4622, lng: 7.4261 },
  'Médéa': { lat: 36.2642, lng: 2.7539 },
  'Khenchela': { lat: 35.4358, lng: 7.1433 },
  'El Bayadh': { lat: 33.6831, lng: 1.0192 },
  'Tizi Ouzou': { lat: 36.7118, lng: 4.0459 },
  'Béchar': { lat: 31.6167, lng: -2.2167 },
  'Boumerdès': { lat: 36.7664, lng: 3.4772 },
  'Tissemsilt': { lat: 35.6072, lng: 1.8106 },
  'Adrar': { lat: 27.8742, lng: -0.2939 },
  'Relizane': { lat: 35.7372, lng: 0.5558 },
  'Mila': { lat: 36.4503, lng: 6.2644 },
  'Aïn Defla': { lat: 36.2642, lng: 1.9678 },
  'Naâma': { lat: 33.2667, lng: -0.3167 },
  'Aïn Témouchent': { lat: 35.2981, lng: -1.1403 },
  'Ghardaia': { lat: 32.4909, lng: 3.6733 },
  'Tamanrasset': { lat: 22.7850, lng: 5.5228 },
  'El Tarf': { lat: 36.7672, lng: 8.3139 },
  'Tindouf': { lat: 27.6711, lng: -8.1478 },
  'Illizi': { lat: 26.4833, lng: 8.4667 },
  'Bouira': { lat: 36.3749, lng: 3.9020 },
  'Tipaza': { lat: 36.5897, lng: 2.4475 }
};

/**
 * Calculates Haversine distance in kilometers between two lat/lng points.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

/**
 * Get coordinates for a given city string (cleans up number prefixes like "01 - Adrar" or "16 - Alger")
 */
export function getCityCoordinates(cityName: string): Coordinates | null {
  if (!cityName) return null;
  const cleanName = cityName.replace(/^[0-9]+\s*-\s*/, '').trim();
  
  for (const [key, coords] of Object.entries(WILAYA_COORDINATES)) {
    if (key.toLowerCase() === cleanName.toLowerCase() || cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase())) {
      return coords;
    }
  }
  return null;
}

/**
 * Calculate distance in km between user location (GPS lat/lng or city) and profile location
 */
export function getCalculatedDistance(
  userLat?: number,
  userLng?: number,
  userCity?: string,
  profileLat?: number,
  profileLng?: number,
  profileCity?: string,
  fallbackKm: number = 10
): number {
  // If exact lat/lng available for both
  if (userLat !== undefined && userLng !== undefined && profileLat !== undefined && profileLng !== undefined) {
    return haversineDistance(userLat, userLng, profileLat, profileLng);
  }

  // If user has lat/lng and profile has city
  if (userLat !== undefined && userLng !== undefined && profileCity) {
    const profCoords = getCityCoordinates(profileCity);
    if (profCoords) {
      return haversineDistance(userLat, userLng, profCoords.lat, profCoords.lng);
    }
  }

  // If both have cities
  if (userCity && profileCity) {
    const uCoords = getCityCoordinates(userCity);
    const pCoords = getCityCoordinates(profileCity);
    if (uCoords && pCoords) {
      const dist = haversineDistance(uCoords.lat, uCoords.lng, pCoords.lat, pCoords.lng);
      return dist === 0 ? Math.max(1, Math.floor(fallbackKm % 5) + 1) : dist;
    }
  }

  return fallbackKm;
}
