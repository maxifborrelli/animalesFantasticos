import { handleGetLostPets, handlePostLostPets } from "@/modules/lost-pets";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleGetLostPets();
}

export async function POST(req: Request) {
  return handlePostLostPets(req);
}
