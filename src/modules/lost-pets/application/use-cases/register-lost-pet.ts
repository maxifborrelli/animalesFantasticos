import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";
import { LostPetsRepository } from "@/modules/lost-pets/application/ports/lost-pets-repository";
import { GeocodingService } from "@/modules/lost-pets/application/ports/GeocodingService";

export async function registerLostPet(
  repository: LostPetsRepository,
  geocodingService: GeocodingService,
  input: RegisterLostPetInput,
): Promise<LostPet> {
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

  const enrichedInput: RegisterLostPetInput = {
    ...input,
    pet: {
      ...input.pet,
      locationText: nextLocationText,
    },
  };

  return repository.createLostPet(enrichedInput);
}
