export interface LatLng {
  lat: number;
  lng: number;
}

export interface Photo extends LatLng {
  id: string;
  imageBlob: Blob;
  /** Hint shown to players while they guess. */
  caption?: string;
  /** Place name revealed with the answer, e.g. "Lake Como, Italy". */
  answerName?: string;
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
