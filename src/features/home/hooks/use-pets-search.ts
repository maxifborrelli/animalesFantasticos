"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { mockPets } from "@/features/home/data/mock-pets";
import { mapApiLostPetToUiPet, mapApiPetToUiPet } from "@/features/home/lib/pet-utils";
import type { ApiFoundPet, ApiLostPet, FiltersState, Pet } from "@/features/home/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const defaultFilters: FiltersState = {
  status: "all",
  species: "all",
  size: "all",
  date: "all",
};

const FILTER_KEYS: Array<keyof FiltersState> = [
  "status",
  "species",
  "size",
  "date",
];
function isValidStatus(value: string | null): FiltersState["status"] {
  if (value === "lost" || value === "found" || value === "all") {
    return value;
  }

  return defaultFilters.status;
}
function isValidSpecies(value: string | null): FiltersState["species"] {
  if (value === "Perro" || value === "Gato" || value === "all") {
    return value;
  }

  return defaultFilters.species;
}
function isValidSize(value: string | null): FiltersState["size"] {
  if (
    value === "small" ||
    value === "medium" ||
    value === "large" ||
    value === "all"
  ) {
    return value;
  }

  return defaultFilters.size;
}
function isValidDate(value: string | null): FiltersState["date"] {
  if (
    value === "today" ||
    value === "week" ||
    value === "month" ||
    value === "all"
  ) {
    return value;
  }

  return defaultFilters.date;
}
function getFiltersFromSearchParams(
  searchParams: URLSearchParams,
): FiltersState {
  return {
    status: isValidStatus(searchParams.get("status")),
    species: isValidSpecies(searchParams.get("species")),
    size: isValidSize(searchParams.get("size")),
    date: isValidDate(searchParams.get("date")),
  };
}

function buildFiltersQueryString(filters: FiltersState): string {
  const params = new URLSearchParams();

  FILTER_KEYS.forEach((key) => {
    const value = filters[key];

    if (value !== defaultFilters[key]) {
      params.set(key, value);
    }
  });

  return params.toString();
}

function matchesDateFilter(
  createdAt: string | undefined,
  dateFilter: FiltersState["date"],
): boolean {
  if (dateFilter === "all") {
    return true;
  }

  if (!createdAt) {
    return false;
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return false;
  }

  const now = new Date();

  if (dateFilter === "today") {
    return createdDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "week") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    return createdDate >= sevenDaysAgo && createdDate <= now;
  }

  if (dateFilter === "month") {
    return (
      createdDate.getFullYear() === now.getFullYear() &&
      createdDate.getMonth() === now.getMonth()
    );
  }

  return true;
}


export function usePetsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFilters = useMemo(() => {
    return getFiltersFromSearchParams(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  const [loadingDbPets, setLoadingDbPets] = useState(true);
  const [dbPets, setDbPets] = useState<Pet[]>([]);
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const fetchPets = useCallback(async () => {
    const [foundResult, lostResult] = await Promise.allSettled([
      fetch("/api/found-pets", {
        method: "GET",
        cache: "no-store",
      }),
      fetch("/api/lost-pets", {
        method: "GET",
        cache: "no-store",
      }),
    ]);

    const nextPets: Pet[] = [];

    if (foundResult.status === "fulfilled") {
      if (foundResult.value.ok) {
        const data = (await foundResult.value.json()) as {
          pets: ApiFoundPet[];
        };
        nextPets.push(...data.pets.map(mapApiPetToUiPet));
      } else {
        console.error("GET /api/found-pets failed", foundResult.value.status);
      }
    } else {
      console.error(foundResult.reason);
    }

    if (lostResult.status === "fulfilled") {
      if (lostResult.value.ok) {
        const data = (await lostResult.value.json()) as { pets: ApiLostPet[] };
        nextPets.push(...data.pets.map(mapApiLostPetToUiPet));
      } else {
        console.error("GET /api/lost-pets failed", lostResult.value.status);
      }
    } else {
      console.error(lostResult.reason);
    }

    return nextPets;
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPets() {
      try {
        setLoadingDbPets(true);
        const nextPets = await fetchPets();

        if (active) {
          setDbPets(nextPets);
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

    loadPets();

    return () => {
      active = false;
    };
  }, [fetchPets]);

  const refreshPets = useCallback(async () => {
    try {
      setLoadingDbPets(true);
      const nextPets = await fetchPets();
      setDbPets(nextPets);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDbPets(false);
    }
  }, [fetchPets]);

  const filtersQueryString = useMemo(() => {
    return buildFiltersQueryString(filters);
  }, [filters]);
   const syncFiltersInUrl = useCallback(
    (nextFilters: FiltersState) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      FILTER_KEYS.forEach((key) => {
        const value = nextFilters[key];

        if (value === defaultFilters[key]) {
          currentParams.delete(key);
        } else {
          currentParams.set(key, value);
        }
      });

      const nextQueryString = currentParams.toString();
      const nextUrl = nextQueryString
        ? `${pathname}?${nextQueryString}`
        : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );
   
  const pets = useMemo(() => {
    return [...dbPets, ...mockPets];
  }, [dbPets]);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesStatus =
        filters.status === "all" || pet.status === filters.status;

      const matchesSpecies =
        filters.species === "all" || pet.species === filters.species;

      const matchesSize =
        filters.size === "all" || pet.size === filters.size;

      const matchesDate = matchesDateFilter(pet.createdAt, filters.date);

      return matchesStatus && matchesSpecies && matchesSize && matchesDate;
    });
  }, [pets, filters.status, filters.species, filters.size, filters.date]);

  const hasActiveFilters = FILTER_KEYS.some(
    (key) => filters[key] !== defaultFilters[key],
  );

  const handleFilterChange = (
    field: keyof FiltersState,
    value: string,
  ) => {
    const nextFilters = {
      ...filters,
      [field]: value,
    } as FiltersState;

    setFilters(nextFilters);
    syncFiltersInUrl(nextFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    syncFiltersInUrl(defaultFilters);
  };

  const addFoundPetFromPayload = (payload: unknown): Pet | null => {
    if (
      !payload ||
      typeof payload !== "object" ||
      !("pet" in payload)
    ) {
      return null;
    }

    const response = payload as { pet: ApiFoundPet };
    const uiPet = mapApiPetToUiPet(response.pet);

    setDbPets((current) => [uiPet, ...current]);

    return uiPet;
  };

  return {
    pets,
    dbPets,
    filteredPets,
    filters,
    filtersQueryString,
    loadingDbPets,
    hasActiveFilters,
    setFilters,
    handleFilterChange,
    clearFilters,
    addFoundPetFromPayload,
    refreshPets,
  };
}