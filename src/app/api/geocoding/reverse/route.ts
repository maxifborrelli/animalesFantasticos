import { NextRequest, NextResponse } from "next/server";
import { NominatimGeocodingService } from "@/modules/found-pets/infrastructure/nominatim-geocoding.service";

const geocodingService = new NominatimGeocodingService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "lat y lon requeridos" },
        { status: 400 }
      );
    }

    const result = await geocodingService.getLocationData(
      Number(lat),
      Number(lon)
    );

    // 🔥 SIEMPRE devolver algo válido
    return NextResponse.json(result ?? {});
    
  } catch (error) {
    console.error("ERROR GEOCODING:", error);

    // 🔥 IMPORTANTE: devolver JSON válido
    return NextResponse.json(
      {
        neighborhood: undefined,
        city: undefined,
        country: undefined,
        fullText: "",
      },
      { status: 200 } // 👈 NO 500 para no romper frontend
    );
  }
}