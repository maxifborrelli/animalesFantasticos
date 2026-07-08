"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiltersBar } from "@/features/home/components/filters-bar";
import { PetDetailsModal } from "@/features/home/components/pet-details-modal";
import { PetsMap } from "@/features/home/components/pets-map";
import { ReportPetModal } from "@/features/report/components/report-pet-modal";
import { SelectedReportPetModal } from "@/features/home/components/selected-report-pet-modal";
import { LoginRequiredModal } from "@/features/home/components/login-required-modal";
import { Pet } from "@/features/home/types";
import type { ReportType } from "@/features/report/types/types";
import type { VectorMatch } from "@/modules/matching/infrastructure/vector-search-repository";
import { formatAbsoluteDateTime } from "@/features/home/lib/pet-utils";
import { ViewPetsListButton } from "../components/view-pets-list-button";
import { VisualSearchWidget } from "@/features/matching/components/visual-search-widget";
import { useRouter } from "next/navigation";
import { usePetsSearch } from "../hooks/use-pets-search";
import { useAuth } from "@/contexts/auth-context";

export function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("found");
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(
    null,
  );
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openChatOnMount, setOpenChatOnMount] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<number | null>(null);
  const [chatPeerName, setChatPeerName] = useState<string | null>(null);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const {
    filteredPets,
    filters,
    filtersQueryString,
    loadingDbPets,
    hasActiveFilters,
    uniqueNeighborhoods,
    uniqueBreeds,
    handleFilterChange,
    clearFilters,
    addFoundPetFromPayload,
    refreshPets,
  } = usePetsSearch();

  useEffect(() => {
    const openPetId = searchParams.get("openPet");
    const openChatParam = searchParams.get("openChat");
    const peerNameParam = searchParams.get("peerName");

    if (!openPetId || loadingDbPets) {
      return;
    }

    const pet = filteredPets.find((item) => item.id === openPetId);
    if (!pet) {
      return;
    }

    const parsedConversationId = openChatParam ? Number(openChatParam) : null;

    setSelectedPet(pet);
    setModalOpen(true);
    setOpenChatOnMount(Boolean(parsedConversationId && Number.isInteger(parsedConversationId)));
    setChatConversationId(
      parsedConversationId && Number.isInteger(parsedConversationId)
        ? parsedConversationId
        : null,
    );
    setChatPeerName(peerNameParam ? decodeURIComponent(peerNameParam) : null);
    router.replace("/mapa", { scroll: false });
  }, [filteredPets, loadingDbPets, router, searchParams]);

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

  const handleMatchSelect = (match: VectorMatch) => {
    const pet: Pet = {
      id: `db-${match.id}`,
      name: match.name,
      status: "found",
      species: match.species,
      sex: match.sex,
      breed: match.breed,
      image: match.imageUrl,
      distance: "",
      lastSeen: formatAbsoluteDateTime(match.foundAt),
      createdAt: match.foundAt,
      location: match.locationText,
      neighborhood: match.neighborhood,
      coordinates: [match.latitude, match.longitude],
      description: match.description,
      ownerId: match.ownerId,
      ownerName: match.owner.fullName,
      ownerPhone: match.owner.phone ?? undefined,
    };
    handlePetSelect(pet);
  };

  const handleMapClick = (coordinates: [number, number]) => {
    if (!user) {
      setLoginRequiredOpen(true);
      return;
    }
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
        filters={filters}
        petCount={filteredPets.length}
        hasActiveFilters={hasActiveFilters}
        uniqueNeighborhoods={uniqueNeighborhoods}
        uniqueBreeds={uniqueBreeds}
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
          <VisualSearchWidget onSelectMatch={handleMatchSelect} />
        </div>
      </div>

      <LoginRequiredModal
        open={loginRequiredOpen}
        onClose={() => setLoginRequiredOpen(false)}
      />

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
        onClose={() => {
          setModalOpen(false);
          setOpenChatOnMount(false);
          setChatConversationId(null);
          setChatPeerName(null);
        }}
        openChatOnMount={openChatOnMount}
        chatConversationId={chatConversationId}
        chatPeerName={chatPeerName}
        onResolved={refreshPets}
      />
    </main>
  );
}
