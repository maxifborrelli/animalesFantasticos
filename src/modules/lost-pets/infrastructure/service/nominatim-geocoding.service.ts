import { GeocodingService } from "../../application/ports/GeocodingService";

export class NominatimGeocodingService implements GeocodingService {
  async getLocationData(lat: number, lon: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );


    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.status}`);
    }

    const text = await res.text();
    if (!text) {
      throw new Error("Respuesta vacía de Nominatim");
    }
    const data = await res.json();
    
    return {
      neighborhood:
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.city_district,
      city: data.address?.city,
      country: data.address?.country,
      fullText: data.display_name,
    };
  }
}