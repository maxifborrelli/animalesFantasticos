import { PetSpecies } from "@/modules/shared/domain/pet-species";
export type { PetSpecies };

export interface FoundPetOwner {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface FoundPet {
  id: number;
  userId?: number | null;
  name: string;
  species: PetSpecies;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  foundAt: string;
  owner: FoundPetOwner;
}

export interface RegisterFoundPetInput {
  userId?: number | null;
  pet: {
    name: string;
    species: PetSpecies;
    breed: string;
    imageUrl: string | null;
    description: string;
    locationText: string | null;
    latitude: number;
    longitude: number;
  };
  owner: {
    fullName: string;
    phone: string;
    email: string | null;
  };
}
