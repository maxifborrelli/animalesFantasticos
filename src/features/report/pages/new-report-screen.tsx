"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { LeafletMouseEvent } from "leaflet";
import { FormEvent, useEffect, useState } from "react";
import { ChevronDown, Loader2, PawPrint, Upload, X } from "lucide-react";
import type { ApiFoundPet } from "@/features/home/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const MapClickCapture = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      return function MapClickCaptureImpl({
        onMapClick,
      }: {
        onMapClick: (coordinates: [number, number]) => void;
      }) {
        mod.useMapEvents({
          click: (event: LeafletMouseEvent) => {
            onMapClick([event.latlng.lat, event.latlng.lng]);
          },
        });

        return null;
      };
    }),
  { ssr: false },
);

type ReportFormState = {
  name: string;
  species: "Perro" | "Gato" | "Otro";
  size: "Pequeno" | "Mediano" | "Grande";
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
};

type DuplicateCandidate = {
  id: string;
  name: string;
  species: string;
  location: string;
  coordinates: [number, number];
};

const defaultMapCenter: [number, number] = [-34.5875, -58.42];
const defaultFormState: ReportFormState = {
  name: "",
  species: "Perro",
  size: "Mediano",
  breed: "",
  imageUrl: "",
  description: "",
  locationText: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
};

function getDistanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapApiPetToDuplicateCandidate(apiPet: ApiFoundPet): DuplicateCandidate {
  return {
    id: `db-${apiPet.id}`,
    name: apiPet.name,
    species: apiPet.species,
    location: apiPet.locationText,
    coordinates: [apiPet.latitude, apiPet.longitude],
  };
}

function findDuplicateReport(
  existingPets: DuplicateCandidate[],
  name: string,
  species: string,
  coordinates: [number, number],
): DuplicateCandidate | null {
  return (
    existingPets.find((pet) => {
      const sameName = pet.name.toLowerCase() === name.toLowerCase();
      const sameSpecies = pet.species.toLowerCase() === species.toLowerCase();
      const isClose = getDistanceKm(pet.coordinates, coordinates) < 1;

      return sameName && sameSpecies && isClose;
    }) ?? null
  );
}

export function NewReportScreen() {
  const [reportForm, setReportForm] = useState<ReportFormState>(defaultFormState);
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Partial<Record<"name" | "description" | "imageUrl" | "coordinates", string>>>({});
  const [existingPets, setExistingPets] = useState<DuplicateCandidate[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCandidate | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savingPet, setSavingPet] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    import("leaflet").then((L) => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadExistingReports() {
      try {
        const response = await fetch("/api/found-pets", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { pets: ApiFoundPet[] };

        if (active) {
          setExistingPets(payload.pets.map(mapApiPetToDuplicateCandidate));
        }
      } catch {
        // If this fails, report creation still works; only duplicate hints are skipped.
      }
    }

    loadExistingReports();

    return () => {
      active = false;
    };
  }, []);

  const handleMapClick = (coordinates: [number, number]) => {
    const [latitude, longitude] = coordinates;

    setReportLocation(coordinates);
    setErrors((current) => ({ ...current, coordinates: "" }));
    setReportForm((current) => ({
      ...current,
      locationText: current.locationText || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    }));
  };

  const handleFormChange = <T extends keyof ReportFormState>(field: T, value: ReportFormState[T]) => {
    if (field === "name" || field === "description" || field === "imageUrl") {
      setErrors((current) => ({ ...current, [field]: "" }));
    }

    setReportForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<"name" | "description" | "imageUrl" | "coordinates", string>> = {};

    if (!reportForm.name.trim()) {
      nextErrors.name = "El nombre es obligatorio.";
    }

    if (!reportForm.description.trim()) {
      nextErrors.description = "La descripcion es obligatoria.";
    }

    if (!reportForm.imageUrl.trim()) {
      nextErrors.imageUrl = "Ingresa una URL de imagen.";
    }

    if (!reportLocation) {
      nextErrors.coordinates = "Marca la ubicacion en el mapa.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const publishReport = async () => {
    if (!reportLocation) {
      return;
    }

    setSubmitError(null);
    setSavingPet(true);

    try {
      const response = await fetch("/api/found-pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pet: {
            name: reportForm.name,
            species: reportForm.species,
            breed: reportForm.breed,
            imageUrl: reportForm.imageUrl,
            description: reportForm.description,
            locationText: reportForm.locationText,
            latitude: reportLocation[0],
            longitude: reportLocation[1],
          },
          finder: {
            fullName: reportForm.ownerName,
            phone: reportForm.ownerPhone,
            email: reportForm.ownerEmail,
          },
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo guardar el reporte.");
      }

      setSubmitted(true);
      setReportForm(defaultFormState);
      setReportLocation(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error guardando el reporte.");
    } finally {
      setSavingPet(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validate() || !reportLocation) {
      return;
    }

    const duplicate = findDuplicateReport(
      existingPets,
      reportForm.name,
      reportForm.species,
      reportLocation,
    );

    if (duplicate) {
      setDuplicateWarning(duplicate);
      return;
    }

    await publishReport();
  };

  const handlePublishDespiteDuplicate = async () => {
    setDuplicateWarning(null);
    await publishReport();
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PawPrint className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Alerta publicada</h2>
        <p className="text-muted-foreground">Tu reporte se guardo correctamente.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
          >
            Cargar otro reporte
          </button>
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        {duplicateWarning && (
          <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <PawPrint className="h-6 w-6 text-yellow-700" />
              </div>

              <h3 className="mb-2 text-lg font-bold text-foreground">Posible reporte duplicado</h3>
              <p className="mb-1 text-sm text-muted-foreground">Ya existe uno parecido:</p>
              <p className="mb-4 text-sm font-semibold text-foreground">
                {duplicateWarning.name} ({duplicateWarning.species}) - {duplicateWarning.location}
              </p>
              <p className="mb-6 text-sm text-muted-foreground">Queres publicarlo igual?</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="flex-1 rounded-full border border-border py-2 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handlePublishDespiteDuplicate();
                  }}
                  className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Publicar igual
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Nuevo reporte</h1>
            <p className="text-sm text-muted-foreground">
              Completa los datos para publicar una mascota encontrada.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Volver al mapa
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">1. Foto</h2>
              <div className="rounded-3xl border border-border bg-white p-4">
                <label className="mb-3 block text-sm font-medium text-foreground">URL de imagen</label>
                <div
                  className={`mb-3 flex h-11 items-center gap-2 rounded-2xl border px-3 ${
                    errors.imageUrl ? "border-red-400" : "border-border"
                  }`}
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={reportForm.imageUrl}
                    onChange={(event) => handleFormChange("imageUrl", event.target.value)}
                    placeholder="https://..."
                    className="h-full w-full bg-transparent text-sm outline-none"
                  />
                </div>

                <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/20">
                  {reportForm.imageUrl ? (
                    <Image
                      src={reportForm.imageUrl}
                      alt="Vista previa de mascota"
                      width={800}
                      height={520}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <p className="px-4 text-center text-sm text-muted-foreground">
                      Ingresa una URL para ver la vista previa de la foto.
                    </p>
                  )}
                </div>

                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl}</p>}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">2. Ubicacion</h2>
              <div className="rounded-3xl border border-border bg-white p-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  {reportLocation
                    ? `Ubicacion seleccionada: ${reportLocation[0].toFixed(4)}, ${reportLocation[1].toFixed(4)}`
                    : "Hace click en el mapa para marcar la ubicacion"}
                </p>

                <div
                  className={`relative h-[280px] w-full overflow-hidden rounded-2xl border ${
                    errors.coordinates ? "border-red-400" : "border-border"
                  }`}
                >
                  <MapContainer
                    center={reportLocation ?? defaultMapCenter}
                    zoom={13}
                    className="z-0 h-full w-full"
                    scrollWheelZoom={true}
                  >
                    <MapClickCapture onMapClick={handleMapClick} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reportLocation && <Marker position={reportLocation} />}
                  </MapContainer>
                </div>

                {errors.coordinates && <p className="mt-2 text-xs text-red-500">{errors.coordinates}</p>}
              </div>
            </section>
          </div>

          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">3. Datos de la mascota</h2>
            <div className="rounded-3xl border border-border bg-white p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Especie</span>
                  <div className="relative">
                    <select
                      value={reportForm.species}
                      onChange={(event) =>
                        handleFormChange(
                          "species",
                          event.target.value as ReportFormState["species"],
                        )
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-border bg-white px-3 pr-10"
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Tamano</span>
                  <div className="relative">
                    <select
                      value={reportForm.size}
                      onChange={(event) =>
                        handleFormChange("size", event.target.value as ReportFormState["size"])
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-border bg-white px-3 pr-10"
                    >
                      <option value="Pequeno">Pequeno</option>
                      <option value="Mediano">Mediano</option>
                      <option value="Grande">Grande</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Nombre</span>
                  <input
                    required
                    value={reportForm.name}
                    onChange={(event) => handleFormChange("name", event.target.value)}
                    className={`h-11 w-full rounded-2xl border px-3 ${
                      errors.name ? "border-red-400" : "border-border"
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </label>

                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Raza</span>
                  <input
                    required
                    value={reportForm.breed}
                    onChange={(event) => handleFormChange("breed", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border px-3"
                  />
                </label>

                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Descripcion</span>
                  <textarea
                    required
                    rows={3}
                    value={reportForm.description}
                    onChange={(event) => handleFormChange("description", event.target.value)}
                    className={`w-full resize-none rounded-2xl border px-3 py-2 ${
                      errors.description ? "border-red-400" : "border-border"
                    }`}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </label>

                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Direccion o referencia</span>
                  <input
                    value={reportForm.locationText}
                    onChange={(event) => handleFormChange("locationText", event.target.value)}
                    placeholder="Ej: Av. Santa Fe 2400"
                    className="h-11 w-full rounded-2xl border border-border px-3"
                  />
                </label>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">4. Contacto</h2>
            <div className="rounded-3xl border border-border bg-white p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Persona que encontro</span>
                  <input
                    required
                    value={reportForm.ownerName}
                    onChange={(event) => handleFormChange("ownerName", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border px-3"
                  />
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Telefono</span>
                  <input
                    required
                    value={reportForm.ownerPhone}
                    onChange={(event) => handleFormChange("ownerPhone", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border px-3"
                  />
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Email (opcional)</span>
                  <input
                    type="email"
                    value={reportForm.ownerEmail}
                    onChange={(event) => handleFormChange("ownerEmail", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border px-3"
                  />
                </label>
              </div>
            </div>
          </section>

          {submitError && (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPet}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-center text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {savingPet && <Loader2 className="h-5 w-5 animate-spin" />}
            Publicar alerta
          </button>
        </form>
      </div>
    </main>
  );
}
