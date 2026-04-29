export interface GeocodingResult {
  neighborhood?: string;
  city?: string;
  country?: string;
  fullText: string;
}

export interface GeocodingService {
  getLocationData(lat: number, lon: number): Promise<GeocodingResult>;
}