export interface Pet {
  id: string;
  name: string;
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

export interface FiltersState {
  species: string;
  size: string;
  date: string;
}

export interface ReportFormState {
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}
