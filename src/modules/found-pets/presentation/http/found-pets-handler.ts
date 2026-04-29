import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { listFoundPets } from "@/modules/found-pets/application/use-cases/list-found-pets";
import { registerFoundPet } from "@/modules/found-pets/application/use-cases/register-found-pet";
import { validateRegisterFoundPetPayload } from "@/modules/found-pets/application/validators/register-found-pet";
import { PrismaFoundPetsRepository } from "@/modules/found-pets/infrastructure/prisma-found-pets-repository";
import { NominatimGeocodingService } from "@/modules/found-pets/infrastructure/nominatim-geocoding.service";

const repository = new PrismaFoundPetsRepository();
const geocodingService = new NominatimGeocodingService();

export async function handleGetFoundPets() {
  try {
    const pets = await listFoundPets(repository);
    return NextResponse.json({ pets }, { status: 200 });
  } catch (error) {
    console.error("GET /api/found-pets failed", error);
    return NextResponse.json(
      { message: "No se pudieron cargar las mascotas encontradas." },
      { status: 500 },
    );
  }
}

export async function handlePostFoundPets(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = validateRegisterFoundPetPayload(body);
    const pet = await registerFoundPet(repository, geocodingService, input);

    return NextResponse.json({ pet }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/found-pets failed", error);
    return NextResponse.json(
      { message: "No se pudo guardar el reporte en base de datos." },
      { status: 500 },
    );
  }
}
