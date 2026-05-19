export interface Pet {
  id: string;
  name: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  size?: string;
  image: string;
  distance: string;
  lastSeen: string;
  createdAt?: string;
  location: string;
  coordinates: [number, number];
  description: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface ApiFoundPet {
  id: number;
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  foundAt: string;
  owner: {
    fullName: string;
    phone: string;
  };
}

export interface ApiLostPet {
  id: number;
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  createdAt: string;
  owner: {
    fullName: string;
    phone: string;
    email: string | null;
  };
}

export interface FiltersState {
  status: string;
  species: string;
  size: string;
  date: string;
}

