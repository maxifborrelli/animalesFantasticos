"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Icon, LeafletMouseEvent } from "leaflet";
import { Pet } from "@/features/home/types";

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
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
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

interface PetsMapProps {
  pets: Pet[];
  onMapClick: (coordinates: [number, number]) => void;
  onMarkerClick: (pet: Pet) => void;
  onPetSelect: (pet: Pet) => void;
}

export function PetsMap({ pets, onMapClick, onMarkerClick, onPetSelect }: PetsMapProps) {
  const [markerIcons, setMarkerIcons] = useState<
    | {
        found: Icon;
        lost: Icon;
      }
    | null
  >(null);

  useEffect(() => {
    let active = true;

    import("leaflet").then((L) => {
      if (!active) {
        return;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const iconOptions = {
        iconSize: [25, 41] as [number, number],
        iconAnchor: [12, 41] as [number, number],
        popupAnchor: [1, -34] as [number, number],
        shadowSize: [41, 41] as [number, number],
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      };

      setMarkerIcons({
        found: new L.Icon({
          ...iconOptions,
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        }),
        lost: new L.Icon({
          ...iconOptions,
          iconRetinaUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        }),
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[-34.5875, -58.42]}
        zoom={13}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapClickCapture onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerIcons &&
          pets.map((pet) => {
            const markerIcon = markerIcons[pet.status] ?? markerIcons.found;

            return (
              <Marker
                key={pet.id}
                position={pet.coordinates}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onMarkerClick(pet),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <Image
                      src={pet.image}
                      alt={pet.name}
                      width={320}
                      height={128}
                      unoptimized
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                    />

                    {/* Cambiamos <p> y <h4> por <div> para evadir el CSS por defecto de Leaflet */}
                    <div className="mb-3 flex flex-col gap-0.5">
                      <div className="text-sm font-semibold leading-none text-foreground">
                        {pet.name}
                      </div>
                      <div className="text-xs leading-none text-muted-foreground mb-1">
                        {pet.species} • {pet.breed}
                      </div>

                      {pet.createdAt && (
                        <div className="text-[10px] leading-none text-muted-foreground flex items-center">
                          <span className="font-semibold text-foreground mr-1">
                            Publicado:
                          </span>
                          {new Date(pet.createdAt).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                      {pet.lastSeen && (
                        <div className="text-[10px] leading-none text-muted-foreground flex items-center">
                          <span className="font-semibold text-foreground mr-1">
                            Última vez visto:
                          </span>
                          {pet.lastSeen}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onPetSelect(pet)}
                      className="w-full rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 mt-1"
                    >
                      Ver detalles
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}