"use client";

import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { formatAbsoluteDateTime } from "@/features/home/lib/pet-utils";
import { Pet } from "@/features/home/types";

interface PetsListProps {
  pets: Pet[];
  selectedPetId?: string;
  loadingDbPets: boolean;
  onPetSelect: (pet: Pet) => void;
}

export function PetsList({ pets, selectedPetId, loadingDbPets, onPetSelect }: PetsListProps) {
  return (
    <div className="w-full overflow-y-auto border-r bg-secondary/20 md:w-2/5 lg:w-1/3">
      <div className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-1">
        {pets.map((pet) => (
          <article
            key={pet.id}
            onClick={() => onPetSelect(pet)}
            className={`cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg ${
              selectedPetId === pet.id ? "ring-2 ring-primary shadow-lg" : ""
            }`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              <Image
                src={pet.image}
                alt={pet.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 30vw"
                unoptimized
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
              <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs backdrop-blur-sm">
                {pet.distance}
              </div>
            </div>
            <div className="p-4">
              <h3 className="mb-1 line-clamp-1 text-base font-semibold">{pet.name}</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {pet.species} • {pet.breed}
              </p>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{pet.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Visto {pet.lastSeen}</span>
                </div>
                {pet.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Publicado {formatAbsoluteDateTime(pet.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}

        {loadingDbPets && (
          <div className="col-span-full rounded-2xl border border-border bg-white p-5 text-sm text-muted-foreground">
            Cargando reportes guardados en base de datos...
          </div>
        )}
      </div>
    </div>
  );
}
