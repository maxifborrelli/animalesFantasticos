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
    neighborhood: apiPet.neighborhood,
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

  const parts = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
  }).formatToParts(date);

  const partByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${partByType.day}/${partByType.month}/${partByType.year}, ${partByType.hour}:${partByType.minute}`;
}
