export interface LatLng {
  lat: number;
  lng: number;
}

export interface Photo extends LatLng {
  id: string;
  imageBlob: Blob;
  caption?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  /** Unix epoch milliseconds. */
  createdAt: number;
  photos: Photo[];
}

export function newId(): string {
  return crypto.randomUUID();
}
