"use client";

import { useRef, useCallback, useState } from "react";
import { useVisualSearch } from "@/features/matching/hooks/use-visual-search";
import type { VectorMatch } from "@/modules/matching/infrastructure/vector-search-repository";

function formatScore(score: number): string {
  return `${Math.round(Math.max(0, Math.min(1, score)) * 100)}%`;
}

function scoreColor(score: number): string {
  if (score >= 0.75) return "bg-green-500";
  if (score >= 0.5) return "bg-yellow-500";
  return "bg-orange-400";
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface MatchCardProps {
  match: VectorMatch;
  onSelect: () => void;
}

function MatchCard({ match, onSelect }: MatchCardProps) {
  const [contactVisible, setContactVisible] = useState(false);

  return (
    <div
      onClick={onSelect}
      className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 shadow-sm cursor-pointer hover:border-primary hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={match.imageUrl}
          alt={`${match.species} encontrado`}
          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=80";
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{match.name}</p>
          <p className="text-xs text-muted-foreground">
            {match.species} · {match.breed}
          </p>
          <p className="text-xs text-muted-foreground truncate">{match.neighborhood}</p>
          <p className="text-xs text-muted-foreground">{formatDate(match.foundAt)}</p>
        </div>
      </div>

      {/* Barra de similitud */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Similitud</span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${scoreColor(match.score)}`}
            style={{ width: formatScore(match.score) }}
          />
        </div>
        <span className="text-xs font-medium text-foreground">{formatScore(match.score)}</span>
      </div>

      {/* Contacto */}
      {contactVisible ? (
        <div className="rounded-lg bg-muted p-2 text-xs space-y-1" onClick={(e) => e.stopPropagation()}>
          <p className="font-medium text-foreground">{match.owner.fullName}</p>
          {match.owner.phone && (
            <p className="text-muted-foreground">
              Tel:{" "}
              <a href={`tel:${match.owner.phone}`} className="text-primary underline">
                {match.owner.phone}
              </a>
            </p>
          )}
          <p className="text-muted-foreground">
            Email:{" "}
            <a
              href={`mailto:${match.owner.email}`}
              className="text-primary underline break-all"
            >
              {match.owner.email}
            </a>
          </p>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setContactVisible(true); }}
          className="w-full rounded-lg border border-primary py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          Ver datos de contacto
        </button>
      )}
    </div>
  );
}

interface UploadZoneProps {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
}

function UploadZone({ previewUrl, onFileSelect }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
      {previewUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={previewUrl}
          alt="Preview"
          className="max-h-36 rounded-lg object-contain"
        />
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2 h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm text-muted-foreground text-center">
            Arrastrá o hacé clic para subir una foto
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">JPEG, PNG, WEBP — hasta 20 MB</p>
        </>
      )}
    </div>
  );
}

const SPECIES_OPTIONS = [
  { label: "Perro", emoji: "🐶" },
  { label: "Gato", emoji: "🐱" },
  { label: "Otro", emoji: "🐾" },
];

interface VisualSearchWidgetProps {
  onSelectMatch?: (match: VectorMatch) => void;
}

export function VisualSearchWidget({ onSelectMatch }: VisualSearchWidgetProps) {
  const {
    widgetState,
    species,
    petName,
    petDescription,
    previewUrl,
    matches,
    errorMessage,
    handleOpen,
    handleClose,
    handleSpeciesSelect,
    handleNameChange,
    handleDescriptionChange,
    handleImageSelect,
    handleSearch,
    reset,
  } = useVisualSearch();

  const isOpen = widgetState !== "closed";
  const isLoading = widgetState === "loading" || widgetState === "removing-bg";
  const hasImage = previewUrl !== null;

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Buscar mi mascota por foto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span>Buscar mi mascota</span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-6 right-6 z-[1000] flex w-full max-w-sm flex-col rounded-2xl bg-background shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <h2 className="font-semibold text-sm text-foreground">
                ¿Perdiste a tu mascota?
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body con scroll */}
          <div className="flex flex-col gap-3 overflow-y-auto p-4" style={{ maxHeight: "70vh" }}>

            {/* PASO 1: selección de especie */}
            {widgetState === "species-select" && (
              <>
                <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Primero decime, ¿qué tipo de mascota es la que perdiste?
                </div>
                <div className="flex gap-2">
                  {SPECIES_OPTIONS.map(({ label, emoji }) => (
                    <button
                      key={label}
                      onClick={() => handleSpeciesSelect(label)}
                      className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border bg-muted/30 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
                    >
                      <span className="text-xl">{emoji}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* PASO 2: upload + datos opcionales */}
            {(widgetState === "idle" || widgetState === "loading" || widgetState === "removing-bg") && (
              <>
                <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  {species && species !== "Otro"
                    ? `Perfecto, voy a buscar entre los ${species.toLowerCase()}s encontrados. Subí una foto de tu mascota.`
                    : "Subí una foto de tu mascota y busco posibles coincidencias entre las reportadas como encontradas 🐾"}
                </div>
                <UploadZone previewUrl={previewUrl} onFileSelect={handleImageSelect} />
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (opcional)"
                    value={petName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <textarea
                    placeholder="Descripción breve: color, tamaño, marcas distintivas... (opcional)"
                    value={petDescription}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>
              </>
            )}

            {/* Preview cuando ya hay imagen y se quiere cambiar */}
            {(widgetState === "results" || widgetState === "no-results" || widgetState === "error") &&
              previewUrl && (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Imagen buscada"
                    className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Imagen analizada
                      {species ? ` · ${species}` : ""}
                    </p>
                    <button
                      onClick={reset}
                      className="mt-1 text-xs text-primary underline hover:no-underline"
                    >
                      Buscar con otra foto
                    </button>
                  </div>
                </div>
              )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  {widgetState === "removing-bg" ? "Procesando imagen..." : "Analizando imagen..."}
                </p>
              </div>
            )}

            {/* Error state */}
            {widgetState === "error" && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage ?? "Ocurrió un error. Intentá de nuevo."}
              </div>
            )}

            {/* No results */}
            {widgetState === "no-results" && (
              <div className="rounded-xl bg-muted/50 px-3 py-3 text-sm text-muted-foreground text-center">
                No encontramos posibles coincidencias por ahora. Los reportes se
                actualizan constantemente.
              </div>
            )}

            {/* Results */}
            {widgetState === "results" && matches.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground">
                  {matches.length} posible{matches.length !== 1 ? "s" : ""} coincidencia
                  {matches.length !== 1 ? "s" : ""} encontrada
                  {matches.length !== 1 ? "s" : ""}. Verificá los datos antes de contactar.
                </p>
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} onSelect={() => onSelectMatch?.(match)} />
                ))}
              </>
            )}

            {/* Botón de búsqueda */}
            {(widgetState === "idle" || widgetState === "error") && (
              <button
                onClick={() => void handleSearch()}
                disabled={!hasImage || isLoading}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buscar posibles coincidencias
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
