"use client";

import { useEffect, useState } from "react";
import { FiltersBar } from "@/features/home/components/filters-bar";
import { PetDetailsModal } from "@/features/home/components/pet-details-modal";
import { PetsMap } from "@/features/home/components/pets-map";
import { ReportPetModal } from "@/features/report/components/report-pet-modal";
import { SelectedReportPetModal } from "@/features/home/components/selected-report-pet-modal";
import { Pet } from "@/features/home/types";
import type { ReportType } from "@/features/report/types/types";
import { ViewPetsListButton } from "../components/view-pets-list-button";
import { useRouter } from "next/navigation";
import { usePetsSearch } from "../hooks/use-pets-search";

export function HomeScreen() {
  const router = useRouter();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("found");
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(
    null,
  );
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const {
    filteredPets,
    filters,
    filtersQueryString,
    loadingDbPets,
    hasActiveFilters,
    handleFilterChange,
    clearFilters,
    addFoundPetFromPayload,
    refreshPets,
  } = usePetsSearch();
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

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setModalOpen(true);
  };

  const handleMarkerClick = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const handleMapClick = (coordinates: [number, number]) => {
    setReportLocation(coordinates);
    setSelectionModalOpen(true);
  };

  const handleSelectFound = () => {
    setReportType("found");
    setSelectionModalOpen(false);
    setReportModalOpen(true);
  };

  const handleSelectLost = () => {
    setReportType("lost");
    setSelectionModalOpen(false);
    setReportModalOpen(true);
  };


  const handleReportSuccess = (payload: unknown) => {
    setReportLocation(null);
    refreshPets();

    if (reportType !== "found") {
      return;
    }
    const uiPet = addFoundPetFromPayload(payload);
    if (!uiPet) {
      return;
    }
    setSelectedPet(uiPet);
    setModalOpen(true);
  };
  const handleViewList = () => {
    const url = filtersQueryString
      ? `/pets/results?${filtersQueryString}`
      : "/pets/results";

    router.push(url);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <FiltersBar
        showFilters={showFilters}
        filters={filters}
        petCount={filteredPets.length}
        hasActiveFilters={hasActiveFilters}
        onToggle={() => setShowFilters((current) => !current)}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative min-w-0 flex-1 bg-secondary/10">
          <PetsMap
            pets={filteredPets}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            onPetSelect={handlePetSelect}
          />
          <ViewPetsListButton
            petCount={filteredPets.length}
            onClick={handleViewList}
          />
        </div>
      </div>

      <SelectedReportPetModal
        open={selectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        onSelectFound={handleSelectFound}
        onSelectLost={handleSelectLost}
      />

      <ReportPetModal
        open={reportModalOpen}
        type={reportType}
        reportLocation={reportLocation}
        onClose={() => setReportModalOpen(false)}
        onSuccess={handleReportSuccess}
      />

      <PetDetailsModal
        pet={selectedPet}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
