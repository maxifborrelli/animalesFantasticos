import { ApiFoundPet, ApiLostPet, Pet } from "@/features/home/types";

export function mapApiPetToUiPet(apiPet: ApiFoundPet): Pet {
  return {
    id: `db-${apiPet.id}`,
    name: apiPet.name,
    status: "found",
    species: apiPet.species,
    breed: apiPet.breed,
    image: apiPet.imageUrl,
    distance: "nuevo",

    // Guardamos una fecha formateada de forma estable
    lastSeen: formatAbsoluteDateTime(apiPet.foundAt),

    // Guardamos también la fecha original por si después necesitás ordenar o calcular
    createdAt: apiPet.foundAt,

    location: apiPet.locationText,
    coordinates: [apiPet.latitude, apiPet.longitude],
    description: apiPet.description,
    ownerName: apiPet.owner.fullName,
    ownerPhone: apiPet.owner.phone,
  };
}

export function mapApiLostPetToUiPet(apiPet: ApiLostPet): Pet {
  return {
    id: `db-lost-${apiPet.id}`,
    name: apiPet.name,
    status: "lost",
    species: apiPet.species,
    breed: apiPet.breed,
    image: apiPet.imageUrl,
    distance: "nuevo",
    lastSeen: apiPet.lastSeen,
    createdAt: apiPet.createdAt,
    location: apiPet.locationText,
    coordinates: [apiPet.latitude, apiPet.longitude],
    description: apiPet.description,
    ownerName: apiPet.owner.fullName,
    ownerPhone: apiPet.owner.phone,
  };
}

export function formatAbsoluteDateTime(isoDate?: string): string {
  if (!isoDate) {
    return "sin fecha";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "sin fecha";
  }

  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return formatter
    .format(date)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "sin fecha";
  }

  const now = Date.now();
  const deltaMs = date.getTime() - now;
  const deltaHours = Math.round(deltaMs / (1000 * 60 * 60));

  if (Math.abs(deltaHours) < 24) {
    return new Intl.RelativeTimeFormat("es", { numeric: "auto" })
      .format(deltaHours, "hour")
      .replace(/\u00A0/g, " ");
  }

  const deltaDays = Math.round(deltaHours / 24);

  return new Intl.RelativeTimeFormat("es", { numeric: "auto" })
    .format(deltaDays, "day")
    .replace(/\u00A0/g, " ");
}