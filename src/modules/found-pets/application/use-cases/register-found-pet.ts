import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";
import { GeocodingService } from "@/modules/found-pets/application/ports/GeocodingService";

export async function registerFoundPet(
  repository: FoundPetsRepository,
  geocodingService: GeocodingService,
  input: RegisterFoundPetInput,
): Promise<FoundPet> {
  let nextLocationText = input.pet.locationText;

  try {
    const location = await geocodingService.getLocationData(
      input.pet.latitude,
      input.pet.longitude,
    );

    if (location.neighborhood && location.city) {
      nextLocationText = `${location.neighborhood}, ${location.city}`;
    } else if (location.fullText) {
      nextLocationText = location.fullText;
    }
  } catch {
    // Geocoding is best-effort; keep user-provided location/fallback.
  }

  const enrichedInput: RegisterFoundPetInput = {
    ...input,
    pet: {
      ...input.pet,
      locationText: nextLocationText,
    },
  };

  return repository.createFoundPet(enrichedInput);
}
