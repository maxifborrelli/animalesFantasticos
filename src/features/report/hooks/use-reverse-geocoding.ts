import { useEffect, useState } from "react";
import { reverseGeocoding, getNeighborhood, getFullAddress } from "../lib/reverse-geocoding";
import { fetchGeocoding } from "../lib/geocoding-api";

export function useReverseGeocoding(lat?: number, lng?: number) {
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
      useEffect(() => {
    if (!lat || !lng) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await fetchGeocoding(lat, lng);

        setLocationName(data.neighborhood || "Ubicación desconocida");
        setAddress(data.fullText || "Sin dirección");
      } catch (error) {
        console.error(error);
        setLocationName("Error");
        setAddress("Error obteniendo dirección");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lng]);

  return { locationName, address, loading };
}