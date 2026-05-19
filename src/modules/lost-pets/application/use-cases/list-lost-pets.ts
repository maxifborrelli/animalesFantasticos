import { LostPet } from "@/modules/lost-pets/domain/lost-pet";
import { LostPetsRepository } from "@/modules/lost-pets/application/ports/lost-pets-repository";

export async function listLostPets(repository: LostPetsRepository): Promise<LostPet[]> {
  return repository.listLostPets();
}
