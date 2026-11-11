import { newId, type Quiz } from '../types';

/** A photo while editing: the answer pin may not be set yet. */
export interface DraftPhoto {
  id: string;
  imageBlob: Blob;
  caption: string;
  lat: number | null;
  lng: number | null;
  /** True if the pin was pre-filled from the photo's GPS data (and not moved since). */
  fromExif?: boolean;
}

export interface QuizDraft {
  id: string;
  createdAt: number;
  title: string;
  description: string;
  photos: DraftPhoto[];
}

export const TITLE_MAX = 80;
export const DESCRIPTION_MAX = 300;
export const CAPTION_MAX = 200;

export function emptyDraft(): QuizDraft {
  return { id: newId(), createdAt: Date.now(), title: '', description: '', photos: [] };
}

export function draftFromQuiz(quiz: Quiz): QuizDraft {
  return {
    id: quiz.id,
    createdAt: quiz.createdAt,
    title: quiz.title,
    description: quiz.description,
    photos: quiz.photos.map((p) => ({
      id: p.id,
      imageBlob: p.imageBlob,
      caption: p.caption ?? '',
      lat: p.lat,
      lng: p.lng,
    })),
  };
}

export const hasPin = (p: DraftPhoto): boolean => p.lat !== null && p.lng !== null;

export interface DraftValidation {
  ok: boolean;
  titleError?: string;
  photosError?: string;
  /** Ids of photos that still need an answer pin. */
  missingPins: string[];
}

export function validateDraft(d: QuizDraft): DraftValidation {
  const titleError = d.title.trim() ? undefined : 'Give your quiz a title.';
  const missingPins = d.photos.filter((p) => !hasPin(p)).map((p) => p.id);
  let photosError: string | undefined;
  if (d.photos.length === 0) photosError = 'Add at least one photo.';
  else if (missingPins.length === 1) photosError = '1 photo still needs an answer pin.';
  else if (missingPins.length > 1) photosError = `${missingPins.length} photos still need an answer pin.`;
  return { ok: !titleError && !photosError, titleError, photosError, missingPins };
}

/** Converts a valid draft into a Quiz. Throws if any pin is missing. */
export function draftToQuiz(d: QuizDraft): Quiz {
  return {
    id: d.id,
    createdAt: d.createdAt,
    title: d.title.trim(),
    description: d.description.trim(),
    photos: d.photos.map((p) => {
      if (p.lat === null || p.lng === null) throw new Error('Photo is missing its answer pin');
      const caption = p.caption.trim();
      return { id: p.id, imageBlob: p.imageBlob, lat: p.lat, lng: p.lng, ...(caption ? { caption } : {}) };
    }),
  };
}

/** Returns a new array with the item at `from` moved to `to` (clamped). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const result = items.slice();
  if (from < 0 || from >= items.length) return result;
  const target = Math.max(0, Math.min(items.length - 1, to));
  const [item] = result.splice(from, 1);
  result.splice(target, 0, item);
  return result;
}
