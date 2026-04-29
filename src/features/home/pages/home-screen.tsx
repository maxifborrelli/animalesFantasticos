"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { mockPets } from "@/features/home/data/mock-pets";
import { FiltersBar } from "@/features/home/components/filters-bar";
import { PetDetailsModal } from "@/features/home/components/pet-details-modal";
import { PetsList } from "@/features/home/components/pets-list";
import { PetsMap } from "@/features/home/components/pets-map";
import { ReportPetModal } from "@/features/home/components/report-pet-modal";
import { mapApiPetToUiPet } from "@/features/home/lib/pet-utils";
import { ApiFoundPet, FiltersState, Pet, ReportFormState } from "@/features/home/types";
import { SelectedReportPetModal } from "@/features/home/components/selected-report-pet-modal";
import { LostPetModal } from "../components/lost-pet-modal";

const defaultReportForm: ReportFormState = {
  name: "",
  species: "Perro",
  breed: "",
  imageUrl: "",
  description: "",
  locationText: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
};

export function HomeScreen() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingDbPets, setLoadingDbPets] = useState(true);
  const [savingPet, setSavingPet] = useState(false);
  const [dbPets, setDbPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    species: "all",
    size: "all",
    date: "all",
  });
  const [reportForm, setReportForm] = useState<ReportFormState>(defaultReportForm);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [lostReportModalOpen, setLostReportModalOpen] = useState(false);
  

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

    async function loadFoundPets() {
      try {
        const response = await fetch("/api/found-pets", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron obtener reportes guardados.");
        }

        const data = (await response.json()) as { pets: ApiFoundPet[] };

        if (active) {
          setDbPets(data.pets.map(mapApiPetToUiPet));
        }
      } catch (error) {
        if (active) {
          console.error(error);
        }
      } finally {
        if (active) {
          setLoadingDbPets(false);
        }
      }
    }

    loadFoundPets();

    return () => {
      active = false;
    };
  }, []);

  const filteredPets = useMemo(() => [...dbPets, ...mockPets], [dbPets]);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setModalOpen(true);
  };

  const handleMarkerClick = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const openReportModalAt = (coordinates: [number, number]) => {
    // 1. Guardamos la ubicación seleccionada
    setReportLocation(coordinates);
    // 2. En lugar de abrir el formulario directamente, abrimos el modal de selección
    setSelectionModalOpen(true);
  };

  const handleSelectFound = () => {
    // Cerramos el modal de selección
    setSelectionModalOpen(false);
    
    // Preparamos los datos del formulario de mascota encontrada y lo abrimos
    if (reportLocation) {
      const [latitude, longitude] = reportLocation;
      setSubmitError(null);
      setReportForm((current) => ({
        ...current,
        locationText: current.locationText || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      }));
      setReportModalOpen(true);
    }
  };

  const handleSelectLost = () => {
  setSelectionModalOpen(false); // Cierra el menú de selección
  setLostReportModalOpen(true); // Abre el formulario de mascota perdida
};



  const handleMapClick = (coordinates: [number, number]) => {
    openReportModalAt(coordinates);
  };

  const handleCreateReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reportLocation) {
      setSubmitError("Selecciona una ubicacion en el mapa antes de guardar.");
      return;
    }

    setSavingPet(true);
    setSubmitError(null);

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

      const payload = (await response.json()) as { pet: ApiFoundPet } | { message: string };

      if (!response.ok || !("pet" in payload)) {
        const message = "message" in payload ? payload.message : "Error guardando el reporte.";
        throw new Error(message);
      }

      const uiPet = mapApiPetToUiPet(payload.pet);
      setDbPets((current) => [uiPet, ...current]);
      setSelectedPet(uiPet);
      setModalOpen(true);
      setReportModalOpen(false);
      setReportLocation(null);
      setReportForm(defaultReportForm);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo guardar el reporte en este momento.",
      );
    } finally {
      setSavingPet(false);
    }
  };

  const handleReportFormChange = (field: keyof ReportFormState, value: string) => {
    setReportForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFilterChange = (field: keyof FiltersState, value: string) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <FiltersBar
        showFilters={showFilters}
        filters={filters}
        petCount={filteredPets.length}
        onToggle={() => setShowFilters((current) => !current)}
        onFilterChange={handleFilterChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <PetsList
          pets={filteredPets}
          selectedPetId={selectedPet?.id}
          loadingDbPets={loadingDbPets}
          onPetSelect={handlePetSelect}
        />

        <PetsMap
          pets={filteredPets}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onPetSelect={handlePetSelect}
        />
      </div>

     {/* Menú de selección (Encontrada vs Perdida) */}
     <SelectedReportPetModal
      open={selectionModalOpen}
      onClose={() => setSelectionModalOpen(false)}
      onSelectFound={handleSelectFound}
      onSelectLost={handleSelectLost}
     />

      <ReportPetModal
        open={reportModalOpen}
        reportLocation={reportLocation}
        reportForm={reportForm}
        submitError={submitError}
        savingPet={savingPet}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleCreateReport}
        onFormChange={handleReportFormChange}
      />

      <LostPetModal
      open={lostReportModalOpen}
      onClose={() => setLostReportModalOpen(false)}
      reportLocation={reportLocation}
     />

      <PetDetailsModal
        pet={selectedPet}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}