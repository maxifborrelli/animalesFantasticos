"use client";
import "leaflet/dist/leaflet.css";


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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

import type { Mascota } from "../types/indexMascota";
import dynamic from "next/dynamic";
import { Link, PawPrint, Search, User, Menu, Filter, X, MapPin, Calendar } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const mockPets: Mascota[] = [
  {
    id: "1",
    name: "Max",
    species: "Perro",
    breed: "Golden Retriever",
    image:
      "https://images.unsplash.com/photo-1649974139924-875a581c9e0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwZ29sZGVuJTIwcmV0cmlldmVyJTIwZG9nfGVufDF8fHx8MTc3NDkxMTE3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "0.5 km",
    lastSeen: "hace 2 horas",
    location: "Palermo, Buenos Aires",
    coordinates: [-34.5875, -58.42],
    description:
      "Golden Retriever macho de 3 años, muy amigable. Lleva collar azul con placa de identificación. Responde al nombre de Max. Se perdió cerca del parque.",
  },
  {
    id: "2",
    name: "Luna",
    species: "Gato",
    breed: "Negro Común",
    image:
      "https://images.unsplash.com/photo-1660339825696-9bfdc4cf4ed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwYmxhY2slMjBjYXR8ZW58MXx8fHwxNzc0OTk4MDQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "1.2 km",
    lastSeen: "ayer",
    location: "Recoleta, Buenos Aires",
    coordinates: [-34.5885, -58.395],
    description:
      "Gata negra de ojos verdes, muy tímida. No tiene collar. Tiene una pequeña mancha blanca en el pecho. Es asustadiza con extraños.",
  },
  {
    id: "3",
    name: "Rocky",
    species: "Perro",
    breed: "Beagle",
    image:
      "https://images.unsplash.com/photo-1737699430579-3f20b8abc613?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwYmVhZ2xlJTIwZG9nfGVufDF8fHx8MTc3NDk5ODA0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "2.8 km",
    lastSeen: "hace 1 día",
    location: "Belgrano, Buenos Aires",
    coordinates: [-34.5633, -58.4583],
    description:
      "Beagle tricolor muy juguetón. Lleva collar rojo con chapita de identificación. Le encanta correr y perseguir ardillas. Es muy sociable.",
  },
  {
    id: "4",
    name: "Mimi",
    species: "Gato",
    breed: "Atigrado",
    image:
      "https://images.unsplash.com/photo-1675504661658-33940d979a6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwdGFiYnklMjBjYXR8ZW58MXx8fHwxNzc0OTk4MDQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "3.5 km",
    lastSeen: "hace 3 días",
    location: "Villa Crespo, Buenos Aires",
    coordinates: [-34.5992, -58.4383],
    description:
      "Gata atigrada de tamaño mediano, muy cariñosa. Tiene collar rosa con cascabel. Está esterilizada y tiene microchip.",
  },
  {
    id: "5",
    name: "Toby",
    species: "Perro",
    breed: "Labrador",
    image:
      "https://images.unsplash.com/photo-1697777869187-a54d754fcf97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwbGFicmFkb3IlMjBwdXBweXxlbnwxfHx8fDE3NzQ5OTgwNDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "4.1 km",
    lastSeen: "hace 5 días",
    location: "Caballito, Buenos Aires",
    coordinates: [-34.6158, -58.4392],
    description:
      "Labrador joven color chocolate. Muy enérgico y amigable. Necesita medicación diaria. Por favor contactar urgente.",
  },
  {
    id: "6",
    name: "Nieve",
    species: "Gato",
    breed: "Blanco Persa",
    image:
      "https://images.unsplash.com/photo-1761485465180-3c9d75fd7269?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwd2hpdGUlMjBraXR0ZW58ZW58MXx8fHwxNzc0OTk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "1.8 km",
    lastSeen: "hace 12 horas",
    location: "Nuñez, Buenos Aires",
    coordinates: [-34.5442, -58.4578],
    description:
      "Gato persa blanco de pelo largo. Muy tranquilo y casero. No está acostumbrado a estar en la calle. Ojos azules.",
  },
];

export default function Home() {
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    species: "all",
    size: "all",
    date: "all",
  });

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

  const filteredPets = useMemo(() => mockPets, []);

  const handlePetSelect = (pet: Mascota) => {
    setSelectedPet(pet);
    setModalOpen(true);
  };

  const handleMarkerClick = (pet: Mascota) => {
    setSelectedPet(pet);
  };

  return (
    <main className="flex h-screen flex-col bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <PawPrint className="h-6 w-6 text-white" />
            </div>
            <span className="hidden text-xl font-semibold text-foreground sm:inline-block">
              Mascotas Perdidas
            </span>
          </Link>

          <form className="hidden flex-1 max-w-xl mx-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar por nombre, raza, ubicación..."
                className="w-full rounded-full border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Link
              href="/nuevoReporte"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 sm:inline-flex"
            >
              Reportar Pérdida
            </Link>

            <Link
              href="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
            >
              <User className="h-5 w-5" />
            </Link>

            <button className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center rounded-full border border-border bg-white px-3 py-2 text-sm font-medium"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {showFilters && <X className="ml-2 h-3 w-3" />}
            </button>

            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.species}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      species: event.target.value,
                    }))
                  }
                  className="h-9 rounded-full border border-border bg-white px-3 text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="dog">Perros</option>
                  <option value="cat">Gatos</option>
                </select>
                <select
                  value={filters.size}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      size: event.target.value,
                    }))
                  }
                  className="h-9 rounded-full border border-border bg-white px-3 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
                <select
                  value={filters.date}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  className="h-9 rounded-full border border-border bg-white px-3 text-sm"
                >
                  <option value="all">Cualquier fecha</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredPets.length} mascotas perdidas cerca
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full overflow-y-auto border-r bg-secondary/20 md:w-2/5 lg:w-1/3">
          <div className="grid gap-4 p-4 sm:grid-cols-2 md:grid-cols-1">
            {filteredPets.map((pet) => (
              <article
                key={pet.id}
                onClick={() => handlePetSelect(pet)}
                className={`cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg ${
                  selectedPet?.id === pet.id ? "ring-2 ring-primary shadow-lg" : ""
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs backdrop-blur-sm">
                    {pet.distance}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 line-clamp-1 text-base font-semibold">
                    {pet.name}
                  </h3>
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
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hidden flex-1 md:block">
          <MapContainer
            center={[-34.5875, -58.42]}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredPets.map((pet) => (
              <Marker
                key={pet.id}
                position={pet.coordinates}
                eventHandlers={{
                  click: () => handleMarkerClick(pet),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                    />
                    <h4 className="mb-1 text-sm font-semibold">{pet.name}</h4>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {pet.species} • {pet.breed}
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePetSelect(pet)}
                      className="w-full rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      Ver detalles
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {modalOpen && selectedPet && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <img
                src={selectedPet.image}
                alt={selectedPet.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">{selectedPet.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedPet.species} • {selectedPet.breed}
                </p>
              </div>

              <div className="mb-6 grid gap-4 rounded-xl bg-secondary/50 p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Última ubicación</p>
                    <p className="text-sm">{selectedPet.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Último avistamiento</p>
                    <p className="text-sm">{selectedPet.lastSeen}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-sm font-semibold">Descripción</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedPet.description}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold">Zona de desaparición</h4>
                <div className="h-64 w-full overflow-hidden rounded-xl border">
                  <MapContainer
                    center={selectedPet.coordinates}
                    zoom={14}
                    className="h-full w-full"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPet.coordinates} />
                    <Circle
                      center={selectedPet.coordinates}
                      radius={500}
                      pathOptions={{
                        color: "#10b981",
                        fillColor: "#10b981",
                        fillOpacity: 0.1,
                      }}
                    />
                  </MapContainer>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                  Llamar al dueño
                </button>
                <button className="flex-1 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
                  Enviar mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}