"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X, Loader2, Upload, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Cambiamos la importación para usar Pet desde tu archivo de tipos
import type { Pet } from "@/features/home/types";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// Manera correcta de cargar el hook de Leaflet dinámicamente envolviéndolo en un componente
const MapEvents = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod;
      
      function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
        useMapEvents({
          click(e: any) {
            onMapClick(e.latlng.lat, e.latlng.lng);
          },
        });
        return null;
      }
      
      return ClickHandler;
    }),
  { ssr: false }
);



interface LostPetModalProps {
  open: boolean;
  onClose: () => void;
  reportLocation: [number, number] | null;
}

// Actualizamos los errores para que se basen en las keys de Pet
type FormErrors = Partial<Record<keyof Pet, string>>;

export function LostPetModal({ open, onClose, reportLocation }: LostPetModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Estados alineados estrictamente con la interfaz Pet de types.ts
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Perro");
  const [breed, setBreed] = useState("");
  const [image, setImage] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (reportLocation) {
      setCoordinates(reportLocation);
    }
  }, [reportLocation]);

  if (!open) return null;

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates([lat, lng]);
    // Opcional: Actualizar el texto de ubicación con las nuevas coordenadas
    if (!location) {
      setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    setErrors((prev) => ({ ...prev, location: "" }));
  };

 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

   const handleReset = () => {
    setName("");
    setSpecies("Perro");
    setBreed("");
    setDescription("");
    setLastSeen("");
    setLocation("");
    setImage("");
    setOwnerName("");
    setOwnerPhone("");
    setErrors({});
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!breed.trim()) newErrors.breed = "La raza es obligatoria (puedes poner 'Mestizo').";
    if (!lastSeen.trim()) newErrors.lastSeen = "Indica una fecha/hora aproximada.";
    if (!description.trim()) newErrors.description = "La descripción es obligatoria.";
    if (!image) newErrors.image = "Debes subir al menos una foto de la mascota.";
    if (!location.trim() && !coordinates) newErrors.location = "Debes indicar una ubicación.";
    if (!ownerName.trim()) newErrors.ownerName = "Tu nombre es obligatorio.";
    if (!ownerPhone.trim()) newErrors.ownerPhone = "Un teléfono de contacto es obligatorio.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/lost-pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pet: {
            name,
            species,
            breed,
            imageUrl: image,
            lastSeen,
            locationText: location,
            latitude: coordinates?.[0] || 0,
            longitude: coordinates?.[1] || 0,
            description,
          },
          owner: {
            fullName: ownerName,
            phone: ownerPhone,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el reporte de pérdida.");
      }

      // Si todo sale bien, cerramos y limpiamos
      onClose();
      handleReset();
      
    } catch (error) {
      console.error("Error al enviar:", error);
      // Opcional: mostrar error en pantalla
    } finally {
      setIsSubmitting(false);
    }
  };



 

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Reportar Mascota Perdida</h2>
          <p className="text-sm text-muted-foreground">Completa los datos para publicar la alerta.</p>
        </header>

        <div className="space-y-6">
          {/* SECCIÓN DE IMAGEN */}
          <div className="flex flex-col gap-1.5">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-gray-50/50 py-8 text-center transition-colors hover:bg-gray-50 ${
                errors.image ? "border-red-400 bg-red-50/50" : "border-border"
              } ${image ? "border-primary/50 py-0" : ""}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              
              {image ? (
                <img src={image} alt="Preview" className="h-48 w-full object-contain" />
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground group-hover:text-primary" />
                  <p className="text-sm font-medium">Click para subir foto de tu mascota</p>
                </>
              )}
            </div>
            {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
          </div>

          {/* DATOS DE LA MASCOTA */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Nombre de la Mascota</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`h-11 w-full rounded-xl border px-3 outline-none transition-colors ${
                  errors.name ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                }`}
                placeholder="Ej: Firulais"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Especie</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="h-11 w-full rounded-xl border border-border px-3 outline-none focus:border-primary"
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-foreground">Raza</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => {
                  setBreed(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, breed: "" }));
                }}
                className={`h-11 w-full rounded-xl border px-3 outline-none transition-colors ${
                  errors.breed ? "border-red-400" : "border-border focus:border-primary"
                }`}
                placeholder="Ej: Golden Retriever"
              />
              {errors.breed && <p className="text-xs text-red-500">{errors.breed}</p>}
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Descripción (Collar, cicatrices, comportamiento)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Describe a tu mascota..."
              className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary ${
                errors.description ? "border-red-400" : "border-border"
              }`}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* DATOS DE PÉRDIDA Y UBICACIÓN */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Visto por última vez</label>
              <input
                type="text"
                value={lastSeen}
                onChange={(e) => {
                  setLastSeen(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, lastSeen: "" }));
                }}
                className={`h-11 w-full rounded-xl border px-3 outline-none transition-colors ${
                  errors.lastSeen ? "border-red-400" : "border-border focus:border-primary"
                }`}
                placeholder="Ej: Hoy a las 15:00 hrs"
              />
              {errors.lastSeen && <p className="text-xs text-red-500">{errors.lastSeen}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Ubicación aproximada</label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, location: "" }));
                }}
                className={`h-11 w-full rounded-xl border px-3 outline-none transition-colors ${
                  errors.location ? "border-red-400" : "border-border focus:border-primary"
                }`}
                placeholder="Calle, Barrio, Ciudad..."
              />
              {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
            </div>
          </div>

          {/* DATOS DEL DUEÑO */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Tu Nombre</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => {
                  setOwnerName(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, ownerName: "" }));
                }}
                className={`h-11 w-full rounded-xl border px-3 outline-none transition-colors ${
                  errors.ownerName ? "border-red-400" : "border-border focus:border-primary"
                }`}
                placeholder="Ej: Juan Pérez"
              />
              {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Teléfono de Contacto</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => {
                  setOwnerPhone(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, ownerPhone: "" }));
                }}
                className={`h-11 w-full rounded-xl border px-3 outline-none transition-colors ${
                  errors.ownerPhone ? "border-red-400" : "border-border focus:border-primary"
                }`}
                placeholder="Ej: +54 11 1234 5678"
              />
              {errors.ownerPhone && <p className="text-xs text-red-500">{errors.ownerPhone}</p>}
            </div>
          </div>

          <div className="space-y-6">
          {/* MAPA INTERACTIVO */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Ubicación de la desaparición (Haz clic para cambiar)
            </label>
            <div className={`h-64 w-full overflow-hidden rounded-2xl border-2 transition-colors ${errors.location ? 'border-red-400' : 'border-border'}`}>
              <MapContainer 
                center={coordinates || [-34.5875, -58.42]} 
                zoom={15} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {coordinates && <Marker position={coordinates} />}
                {/* Cargamos el manejador de clicks */}
                <MapEvents onMapClick={handleMapClick} />
              </MapContainer>
            </div>
            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
          </div>
          </div>

          {/* ACCIONES */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 md:mt-6"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            Publicar Alerta de Pérdida
          </button>
        </div>
      </div>
    </div>
  );
}