import { ApiFoundPet, Pet } from "@/features/home/types";

export function mapApiPetToUiPet(apiPet: ApiFoundPet): Pet {
  return {
    id: `db-${apiPet.id}`,
    name: apiPet.name,
    species: apiPet.species,
    breed: apiPet.breed,
    image: apiPet.imageUrl,
    distance: "nuevo",
    lastSeen: formatRelativeTime(apiPet.foundAt),
    createdAt: apiPet.foundAt,
    location: apiPet.locationText,
    coordinates: [apiPet.latitude, apiPet.longitude],
    description: apiPet.description,
    ownerName: apiPet.owner.fullName,
    ownerPhone: apiPet.owner.phone,
  };
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const deltaMs = date.getTime() - now;
  const deltaHours = Math.round(deltaMs / (1000 * 60 * 60));

  if (Math.abs(deltaHours) < 24) {
    return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
      deltaHours,
      "hour",
    );
  }

  const deltaDays = Math.round(deltaHours / 24);
  return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(deltaDays, "day");
}

export function formatAbsoluteDateTime(isoDate?: string): string {
  if (!isoDate) {
    return "sin fecha";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "sin fecha";
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!day || !month || !year || !hour || !minute) {
    return "sin fecha";
  }

  return `${day}/${month}/${year}, ${hour}:${minute}`;
}
