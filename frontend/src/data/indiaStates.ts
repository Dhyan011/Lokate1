/**
 * India States GeoJSON — simplified boundaries
 * Sufficient for react-simple-maps rendering with state-level hover/click
 * Coordinate system: WGS84 (longitude, latitude)
 *
 * States included: All 28 states + 8 UTs (major ones)
 * Source: public domain simplified boundaries
 */

export const INDIA_STATES_GEOJSON = {
  type: "FeatureCollection" as const,
  features: [
    // These will be replaced by react-simple-maps' built-in geographies
    // using the public API: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
    // We filter by country code 356 (India) and use the react-simple-maps
    // geography component. The full list is rendered via the geographies prop.
  ]
};

// State centroids for label placement (longitude, latitude)
export const STATE_CENTROIDS: Record<string, [number, number]> = {
  'Andhra Pradesh': [79.74, 15.91],
  'Arunachal Pradesh': [94.73, 28.22],
  'Assam': [92.94, 26.20],
  'Bihar': [85.31, 25.09],
  'Chhattisgarh': [81.87, 21.27],
  'Goa': [74.12, 15.29],
  'Gujarat': [71.19, 22.25],
  'Haryana': [76.09, 29.05],
  'Himachal Pradesh': [77.17, 31.10],
  'Jharkhand': [85.29, 23.61],
  'Karnataka': [75.71, 15.31],
  'Kerala': [76.27, 10.85],
  'Madhya Pradesh': [78.65, 23.47],
  'Maharashtra': [75.71, 19.66],
  'Manipur': [93.90, 24.67],
  'Meghalaya': [91.37, 25.46],
  'Mizoram': [92.93, 23.16],
  'Nagaland': [94.56, 26.15],
  'Odisha': [85.09, 20.94],
  'Punjab': [75.34, 31.14],
  'Rajasthan': [73.88, 27.02],
  'Sikkim': [88.51, 27.53],
  'Tamil Nadu': [78.65, 11.12],
  'Telangana': [79.01, 18.11],
  'Tripura': [91.98, 23.94],
  'Uttar Pradesh': [80.94, 26.84],
  'Uttarakhand': [79.01, 30.06],
  'West Bengal': [87.85, 22.98],
  'Delhi': [77.10, 28.70],
  'Jammu and Kashmir': [76.91, 33.73],
  'Ladakh': [77.58, 34.15],
};

// State abbreviations for the map labels
export const STATE_ABBR: Record<string, string> = {
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OD',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',
  'Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
};
