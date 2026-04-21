"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bell, ChevronDown, PawPrint, Search, Upload, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { Mascota } from "@/types/indexMascota";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

// Hook para manejar clicks en el mapa (tiene que ser componente separado por react-leaflet)
const MapClickHandler = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod;
      function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
        useMapEvents({
          click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
          },
        });
        return null;
      }
      return ClickHandler;
    }),
  { ssr: false }
);

// TODO (backend): reemplazar este array vacío con una llamada a GET /reports
// Ejemplo: const existingPets = await fetch('/api/reports').then(r => r.json())
// El endpoint debería devolver todas las mascotas activas para poder detectar duplicados
// Criterio de duplicado: mismo nombre + misma especie + coordenadas a menos de 1km
const existingPets: Mascota[] = [];

// Calcula distancia en km entre dos coordenadas (fórmula de Haversine)
function getDistanceKm(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Chequea si hay un reporte muy parecido ya cargado
// Criterio: misma especie + nombre igual (ignorando mayúsculas) + coordenadas a menos de 1km
function findDuplicate(
  name: string,
  species: string,
  coordinates: [number, number]
): Mascota | null {
  return (
    existingPets.find((pet) => {
      const sameName = pet.name.toLowerCase() === name.toLowerCase();
      const sameSpecies = pet.species.toLowerCase() === species.toLowerCase();
      const closeBy = getDistanceKm(pet.coordinates, coordinates) < 1;
      return sameName && sameSpecies && closeBy;
    }) ?? null
  );
}

export default function NuevoReporte() {
  // --- Estado del formulario ---
  const [species, setSpecies] = useState("Otro");
  const [size, setSize] = useState("Mediano");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estado de UI ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<Mascota | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    import("leaflet").then((L) => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  // Maneja la selección de imagen
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  }

  // Maneja el click en el mapa para fijar ubicación
  function handleMapClick(lat: number, lng: number) {
    setCoordinates([lat, lng]);
    setErrors((prev) => ({ ...prev, coordinates: "" }));
  }

  // Valida todos los campos y devuelve true si todo está ok
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!description.trim()) newErrors.description = "La descripción es obligatoria.";
    if (!imageFile) newErrors.image = "Tenés que subir una foto.";
    if (!coordinates) newErrors.coordinates = "Hacé click en el mapa para marcar la ubicación.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Maneja el submit del formulario
  function handleSubmit() {
    if (!validate()) return;

    // Chequeo de duplicados
    const duplicate = findDuplicate(name, species, coordinates!);
    if (duplicate) {
      setDuplicateWarning(duplicate);
      return;
    }

    // TODO: acá va la llamada al backend cuando esté listo
const createdAt = new Date().toISOString();
console.log("Publicando reporte:", { species, size, name, description, imageFile, coordinates, createdAt });    setSubmitted(true);
  }

  // Si ya se publicó, muestra mensaje de éxito
  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PawPrint className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">¡Alerta publicada!</h2>
        <p className="text-muted-foreground">
          El reporte de <strong>{name}</strong> fue cargado correctamente.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Navbar -- HACER COMPONENTE HEADER */}
      <nav className="w-full bg-primary px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground transition-opacity hover:opacity-80">
            <PawPrint className="h-7 w-7" />
            <span className="text-lg font-bold leading-tight">
              Mascotas
              <br />
              Perdidas
            </span>
          </Link>

          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar mascotas..."
              className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-4 text-primary-foreground">
            <button className="relative transition-opacity hover:opacity-80">
              <Bell className="h-6 w-6" />
              <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full border-2 border-primary bg-destructive"></span>
            </button>
            <button className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary-foreground/20 transition-opacity hover:opacity-80">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Buscador para mobiles */}
      <div className="bg-primary/95 px-4 pb-4 pt-2 md:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar mascotas..."
            className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-sm text-foreground outline-none"
          />
        </div>
      </div>

      {/* Modal de advertencia de duplicado */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <PawPrint className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">¿Ya existe este reporte?</h3>
            <p className="mb-1 text-sm text-muted-foreground">
              Ya hay un reporte muy similar cargado:
            </p>
            <p className="mb-4 text-sm font-semibold text-foreground">
              {duplicateWarning.name} ({duplicateWarning.species}) — {duplicateWarning.location}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              ¿Seguro que querés publicar igual?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 rounded-full border border-border py-2 text-sm font-semibold text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDuplicateWarning(null);
                  // TODO: llamada al backend
                  console.log("Publicando igual:", { species, size, name, description, imageFile, coordinates });
                }}
                className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Publicar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="mx-auto mt-6 max-w-4xl px-4 md:mt-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Seccion Subir Foto */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">1. Subir Foto</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all hover:border-primary/50 hover:bg-gray-50/50 ${errors.image ? "border-red-400 bg-red-50/30" : "border-border bg-white"
                } ${imagePreview ? "p-0 overflow-hidden" : ""}`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-3xl" />
              ) : (
                <>
                  <Upload className="mb-3 h-10 w-10 text-primary/60" />
                  <p className="text-center font-medium text-muted-foreground">
                    Arrastra o sube
                    <br />
                    una foto
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {errors.image && (
              <p className="mt-2 text-xs text-red-500">{errors.image}</p>
            )}
          </section>

          {/* Seccion Ubicacion */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">2. Ubicación</h2>
            <p className="mb-2 text-xs text-muted-foreground">
              {coordinates
                ? `📍 Ubicación seleccionada: ${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`
                : "Hacé click en el mapa para marcar el lugar"}
            </p>
            <div className={`relative h-[280px] w-full overflow-hidden rounded-3xl border bg-white shadow-sm ${errors.coordinates ? "border-red-400" : "border-border"}`}>
              <MapContainer
                center={[-34.5875, -58.42]}
                zoom={13}
                className="h-full w-full z-0"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {coordinates && <Marker position={coordinates} />}
              </MapContainer>
            </div>
            {errors.coordinates && (
              <p className="mt-2 text-xs text-red-500">{errors.coordinates}</p>
            )}
          </section>
        </div>

        {/* Seccion Datos de la Mascota */}
        <section className="mt-8 md:mt-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">3. Datos de la Mascota</h2>
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Especie */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Especie</label>
                <div className="relative">
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option>Otro</option>
                    <option>Perro</option>
                    <option>Gato</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
              {/* Tamaño */}


              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Tamaño</label>
                <div className="relative">
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option>Pequeño</option>
                    <option>Mediano</option>
                    <option>Grande</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Mascota */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Mascota</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Nombre de la mascota"
                  className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${errors.name ? "border-red-400" : "border-border"
                    }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Descripción (Recuerda agregar tamaño, color, raza o cualquier dato que pueda ser de ayuda)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.trim()) setErrors((prev) => ({ ...prev, description: "" }));
                }}
                placeholder="Describe a tu mascota, tamaño, color, dónde se perdió..."
                className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${errors.description ? "border-red-400" : "border-border"
                  }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
        </section>

        {/* Boton Publicar Alerta */}
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-8 w-full rounded-full bg-primary py-4 text-center text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] md:mt-10"
        >
          Publicar Alerta
        </button>
      </main>
    </div>
  );
}