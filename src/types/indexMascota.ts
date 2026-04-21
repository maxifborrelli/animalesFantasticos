export interface Mascota {
    id: string;
    name: string;
    species: 'Perro' | 'Gato' | string;
    breed: string;
    size: 'Pequeño' | 'Mediano' | 'Grande' | string; 
    image: string;
    distance: string;
    lastSeen: string;
    location: string;
    coordinates: [number, number];
    description: string;
    createdAt: string;
}