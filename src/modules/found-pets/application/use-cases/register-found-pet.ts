import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";

export async function registerFoundPet(
  repository: FoundPetsRepository,
  input: RegisterFoundPetInput,
): Promise<FoundPet> {
  return repository.createFoundPet(input);
}
