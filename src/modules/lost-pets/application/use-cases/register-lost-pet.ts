import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";
import { LostPetsRepository } from "@/modules/lost-pets/application/ports/lost-pets-repository";

export async function registerLostPet(
  repository: LostPetsRepository,
  input: RegisterLostPetInput,
): Promise<LostPet> {
  return repository.createLostPet(input);
}
