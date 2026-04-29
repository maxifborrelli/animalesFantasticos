import { NextResponse } from "next/server";
import { registerLostPet } from "@/modules/lost-pets/application/use-cases/register-lost-pet";
import { validateRegisterLostPetPayload } from "@/modules/lost-pets/application/validators/register-lost-pet";
import { PrismaLostPetsRepository } from "@/modules/lost-pets/infrastructure/prisma-lost-pets-repository";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";

const repository = new PrismaLostPetsRepository();

export async function handlePostLostPets(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = validateRegisterLostPetPayload(body);
    const pet = await registerLostPet(repository, input);

    return NextResponse.json({ pet }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/lost-pets failed", error);
    return NextResponse.json(
      { message: "No se pudo guardar el reporte de mascota perdida." },
      { status: 500 },
    );
  }
}
