export interface GeocodingResponse {
  neighborhood?: string;
  city?: string;
  country?: string;
  fullText: string;
}

export async function fetchGeocoding(
  lat: number,
  lng: number
): Promise<GeocodingResponse> {
  const res = await fetch(
    `/api/geocoding/reverse?lat=${lat}&lon=${lng}`
  );

 if (!res.ok) {
  console.warn("Geocoding falló", res.status);
  return {
    neighborhood: undefined,
    fullText: "",
  };
}

const text = await res.text();

if (!text) {
  return {
    neighborhood: undefined,
    fullText: "",
  };
}

return JSON.parse(text);
}