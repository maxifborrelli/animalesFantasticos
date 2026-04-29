import { GeocodingResult, GeocodingService } from "@/modules/found-pets/application/ports/GeocodingService";

export class NominatimGeocodingService implements GeocodingService {
  async getLocationData(lat: number, lon: number): Promise<GeocodingResult> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "animales-fantasticos-app",
        },
      }
    );

    const data = await res.json();

    // 👇 1. agarrar address
    const address = data?.address || {};

    // 👇 2. calle y número
    const street = address.road || "";
    const number = address.house_number || "";

    // 👇 3. ORDEN CORRECTO → calle + número
    const streetWithNumber = [street, number].filter(Boolean).join(" ");

    // 👇 4. barrio
    const neighborhood =
      address.neighbourhood ||
      address.suburb ||
      address.city_district ||
      address.city;

    // 👇 5. ciudad
    const city = address.city || "Buenos Aires";

    // 👇 6. construir dirección final (NO usar display_name)
    const fullText = streetWithNumber
      ? [streetWithNumber, neighborhood, city, address.country]
          .filter(Boolean)
          .join(", ")
      : data?.display_name || "";

    // 👇 7. devolver resultado
    return {
      neighborhood,
      city,
      country: address.country,
      fullText,
    };
  }
}
