import { PetSpecies } from "@/modules/shared/domain/pet-species";

export interface LostPetOwner {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface LostPet {
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
  lastSeen: string;
  createdAt: string;
  owner: LostPetOwner;
}

export interface RegisterLostPetInput {
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
    lastSeen: string;
  };
  owner: {
    fullName: string;
    phone: string;
    email: string | null;
  };
}
