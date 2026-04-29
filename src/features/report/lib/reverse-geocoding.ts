export interface ReverseGeocodingResult {
  neighbourhood?: string;
  suburb?: string;
  city?: string;
}

export async function reverseGeocoding(lat: number, lng: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );

  if (!response.ok) {
    throw new Error("Error obteniendo ubicación");
  }

  const data = await response.json();

  return data.address as ReverseGeocodingResult;
}

export function getNeighborhood(address: ReverseGeocodingResult) {
  return (
    address.neighbourhood ||
    address.suburb ||
    address.city ||
    "Ubicación desconocida"
  );
  
}
export function getFullAddress(data: any) {
  return (
    data.display_name || // 🔥 dirección completa formateada
    `${data.address?.road || ""} ${data.address?.house_number || ""}, ${
      data.address?.neighbourhood || data.address?.suburb || ""
    }`.trim() ||
    "Ubicación desconocida"
  );
}