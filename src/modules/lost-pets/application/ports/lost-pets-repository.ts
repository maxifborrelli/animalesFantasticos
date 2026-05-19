import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";

export interface LostPetsRepository {
  listLostPets(): Promise<LostPet[]>;
  createLostPet(input: RegisterLostPetInput): Promise<LostPet>;
}
