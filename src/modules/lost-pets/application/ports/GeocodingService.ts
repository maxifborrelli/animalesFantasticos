export interface GeocodingService {
  getLocationData(lat: number, lon: number): Promise<{
    neighborhood?: string;
    city?: string;
    country?: string;
    fullText: string;
  }>;
}