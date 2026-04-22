"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Upload } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/Navbar";

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

export default function NuevoReporte() {
  useEffect(() => {
    import("leaflet").then((L) => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-10">
      <Navbar />

      {/* Contenedor Principal */}
      <main className="mx-auto mt-6 max-w-4xl px-4 md:mt-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Seccion Subir Foto */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              1. Subir Foto
            </h2>
            <div className="flex h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-white transition-all hover:border-primary/50 hover:bg-gray-50/50">
              <Upload className="mb-3 h-10 w-10 text-primary/60" />
              <p className="text-center font-medium text-muted-foreground">
                Arrastra o sube
                <br />
                una foto
              </p>
            </div>
          </section>

          {/* Seccion Ubicacion */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">
              2. Ubicación
            </h2>
            <div className="relative h-[280px] w-full overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
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
                <Marker position={[-34.5875, -58.42]} />
                <Marker position={[-34.595, -58.43]} />
                <Marker position={[-34.58, -58.41]} />
              </MapContainer>
            </div>
          </section>
        </div>

        {/* Seccion Datos de la Mascota */}
        <section className="mt-8 md:mt-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            3. Datos de la Mascota
          </h2>
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Especie */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Especie
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary">
                    <option>Otro</option>
                    <option>Perro</option>
                    <option>Gato</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Mascota */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Mascota
                </label>
                <input
                  type="text"
                  defaultValue="Luna"
                  placeholder="Nombre de la mascota"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Descripción (Recuerda agregar tamaño, color, raza o cualquier dato que pueda ser de ayuda)
              </label>
              <textarea
                rows={3}
                defaultValue="Luna es una Border Collie de 4 años, muy amigable pero asustada. Se perdió cerca del parque. Lleva un collar rosa."
                placeholder="Describe a tu mascota, tamaño, color, dónde se perdió..."
                className="w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Boton Publicar Alerta */}
        <button className="mt-8 w-full rounded-full bg-primary py-4 text-center text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] md:mt-10">
          Publicar Alerta
        </button>
      </main>
    </div>
  );
}
