"use client";

import type { FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { ReportFormState } from "@/features/home/types";

interface ReportPetModalProps {
  open: boolean;
  reportLocation: [number, number] | null;
  reportForm: ReportFormState;
  submitError: string | null;
  savingPet: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof ReportFormState, value: string) => void;
}

export function ReportPetModal({
  open,
  reportLocation,
  reportForm,
  submitError,
  savingPet,
  onClose,
  onSubmit,
  onFormChange,
}: ReportPetModalProps) {
  if (!open || !reportLocation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Reportar mascota encontrada</h2>
            <p className="text-sm text-muted-foreground">
              Carga los datos de la mascota y su contacto responsable.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Nombre de la mascota</span>
              <input
                required
                value={reportForm.name}
                onChange={(event) => onFormChange("name", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Especie</span>
              <select
                value={reportForm.species}
                onChange={(event) => onFormChange("species", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Raza</span>
              <input
                required
                value={reportForm.breed}
                onChange={(event) => onFormChange("breed", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">URL de imagen</span>
              <input
                type="url"
                value={reportForm.imageUrl}
                onChange={(event) => onFormChange("imageUrl", event.target.value)}
                placeholder="https://..."
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              />
            </label>
          </div>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Descripcion</span>
            <textarea
              required
              rows={3}
              value={reportForm.description}
              onChange={(event) => onFormChange("description", event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Direccion o referencia</span>
            <input
              value={reportForm.locationText}
              onChange={(event) => onFormChange("locationText", event.target.value)}
              placeholder="Ej: Av. Santa Fe 2400"
              className="h-11 w-full rounded-xl border border-border bg-white px-3"
            />
          </label>

          <div className="rounded-xl border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
            Coordenadas: {reportLocation[0].toFixed(6)}, {reportLocation[1].toFixed(6)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Persona que encontro</span>
              <input
                required
                value={reportForm.ownerName}
                onChange={(event) => onFormChange("ownerName", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Telefono</span>
              <input
                required
                value={reportForm.ownerPhone}
                onChange={(event) => onFormChange("ownerPhone", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              />
            </label>

            <label className="space-y-1.5 text-sm sm:col-span-2">
              <span className="font-medium">Email (opcional)</span>
              <input
                type="email"
                value={reportForm.ownerEmail}
                onChange={(event) => onFormChange("ownerEmail", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-3"
              />
            </label>
          </div>

          {submitError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
              disabled={savingPet}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingPet}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingPet && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
