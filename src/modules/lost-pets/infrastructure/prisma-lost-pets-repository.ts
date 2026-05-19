import { prisma } from "@/lib/prisma";
import { LostPetsRepository } from "@/modules/lost-pets/application/ports/lost-pets-repository";
import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";

function mapLostPetRecord(pet: {
  id: bigint;
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  createdAt: Date;
  owner: {
    id: bigint;
    fullName: string;
    phone: string;
    email: string | null;
  };
}): LostPet {
  return {
    id: Number(pet.id),
    name: pet.name,
    species: pet.species as LostPet["species"],
    breed: pet.breed,
    imageUrl: pet.imageUrl,
    description: pet.description,
    locationText: pet.locationText,
    latitude: pet.latitude,
    longitude: pet.longitude,
    lastSeen: pet.lastSeen,
    createdAt: pet.createdAt.toISOString(),
    owner: {
      id: Number(pet.owner.id),
      fullName: pet.owner.fullName,
      phone: pet.owner.phone,
      email: pet.owner.email,
    },
  };
}

export class PrismaLostPetsRepository implements LostPetsRepository {
  async listLostPets(): Promise<LostPet[]> {
    const pets = await prisma.lostPet.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pets.map((pet) => mapLostPetRecord(pet));
  }

  async createLostPet(input: RegisterLostPetInput): Promise<LostPet> {
    const createdPet = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.create({
        data: {
          fullName: input.owner.fullName,
          phone: input.owner.phone,
          email: input.owner.email,
        },
      });

      return tx.lostPet.create({
        data: {
          ownerId: owner.id,
          name: input.pet.name,
          species: input.pet.species,
          breed: input.pet.breed,
          imageUrl:
            input.pet.imageUrl ||
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          description: input.pet.description,
          locationText:
            input.pet.locationText ||
            `${input.pet.latitude.toFixed(4)}, ${input.pet.longitude.toFixed(4)}`,
          latitude: input.pet.latitude,
          longitude: input.pet.longitude,
          lastSeen: input.pet.lastSeen,
        },
        include: {
          owner: true,
        },
      });
    });

    return mapLostPetRecord(createdPet);
  }
}
