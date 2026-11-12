import { ANSWER_NAME_MAX, APP_NAME, CAPTION_MAX, EXPORT_FORMAT_VERSION } from '../config';
import { newId, type Photo, type Quiz } from '../types';

/**
 * Export file shape. `kind` + `formatVersion` identify the file; `app` is
 * informational only (so renaming the app doesn't break old exports).
 */
export interface QuizExportFile {
  kind: 'quiz-export';
  formatVersion: number;
  app: string;
  exportedAt: string;
  quiz: {
    title: string;
    description: string;
    createdAt: number;
    photos: ExportedPhoto[];
  };
}

interface ExportedPhoto {
  caption?: string;
  answerName?: string;
  lat: number;
  lng: number;
  mimeType: string;
  /** Base64-encoded image bytes (no data: prefix). */
  imageBase64: string;
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}

const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif|svg\+xml|avif)$/;
const MAX_PHOTOS = 500;

// ---------- base64 helpers (work in browsers and Node) ----------

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToBlob(b64: string, mimeType: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

// ---------- export ----------

export async function quizToExportFile(quiz: Quiz): Promise<QuizExportFile> {
  return {
    kind: 'quiz-export',
    formatVersion: EXPORT_FORMAT_VERSION,
    app: APP_NAME,
    exportedAt: new Date().toISOString(),
    quiz: {
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt,
      photos: await Promise.all(
        quiz.photos.map(async (p) => ({
          ...(p.caption ? { caption: p.caption } : {}),
          ...(p.answerName ? { answerName: p.answerName } : {}),
          lat: p.lat,
          lng: p.lng,
          mimeType: p.imageBlob.type || 'image/jpeg',
          imageBase64: await blobToBase64(p.imageBlob),
        })),
      ),
    },
  };
}

export function exportFileName(quiz: Quiz): string {
  const slug =
    quiz.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'quiz';
  const app = APP_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${app}-${slug}.json`;
}

/** Triggers a browser download of the quiz as a .json file. */
export async function downloadQuiz(quiz: Quiz): Promise<void> {
  const data = await quizToExportFile(quiz);
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFileName(quiz);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- import ----------

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Trimmed, length-limited text, or undefined when empty / not a string. */
const cleanText = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

const isLat = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90;
const isLng = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180;

/**
 * Validates parsed JSON and turns it into a new Quiz with fresh ids
 * (so importing the same file twice gives two independent copies).
 * Throws ImportError with a readable message on any problem.
 */
export function parseExportFile(json: unknown): Quiz {
  if (!isObj(json) || json.kind !== 'quiz-export') {
    throw new ImportError(`This doesn't look like a ${APP_NAME} quiz file.`);
  }
  if (typeof json.formatVersion !== 'number') {
    throw new ImportError('The quiz file is missing its format version.');
  }
  if (json.formatVersion > EXPORT_FORMAT_VERSION) {
    throw new ImportError(
      'This quiz was exported by a newer version of the app. Please update and try again.',
    );
  }
  const q = json.quiz;
  if (!isObj(q)) throw new ImportError('The quiz file has no quiz data.');
  if (typeof q.title !== 'string' || !q.title.trim()) {
    throw new ImportError('The quiz in this file has no title.');
  }
  if (!Array.isArray(q.photos) || q.photos.length === 0) {
    throw new ImportError('The quiz in this file has no photos.');
  }
  if (q.photos.length > MAX_PHOTOS) {
    throw new ImportError(`The quiz has too many photos (max ${MAX_PHOTOS}).`);
  }

  const photos: Photo[] = q.photos.map((raw, i) => {
    const n = i + 1;
    if (!isObj(raw)) throw new ImportError(`Photo ${n} is malformed.`);
    if (!isLat(raw.lat) || !isLng(raw.lng)) {
      throw new ImportError(`Photo ${n} has an invalid answer location.`);
    }
    if (typeof raw.mimeType !== 'string' || !ALLOWED_MIME.test(raw.mimeType)) {
      throw new ImportError(`Photo ${n} is not a supported image type.`);
    }
    if (typeof raw.imageBase64 !== 'string' || raw.imageBase64.length === 0) {
      throw new ImportError(`Photo ${n} has no image data.`);
    }
    let imageBlob: Blob;
    try {
      imageBlob = base64ToBlob(raw.imageBase64, raw.mimeType);
    } catch {
      throw new ImportError(`Photo ${n} has corrupted image data.`);
    }
    const caption = cleanText(raw.caption, CAPTION_MAX);
    const answerName = cleanText(raw.answerName, ANSWER_NAME_MAX);
    return {
      id: newId(),
      imageBlob,
      lat: raw.lat,
      lng: raw.lng,
      ...(caption ? { caption } : {}),
      ...(answerName ? { answerName } : {}),
    };
  });

  return {
    id: newId(),
    title: q.title.trim(),
    description: typeof q.description === 'string' ? q.description : '',
    createdAt: Date.now(),
    photos,
  };
}

/** Reads a user-selected File and validates it. */
export async function readImportFile(file: File): Promise<Quiz> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new ImportError(`"${file.name}" isn't a valid quiz file (it couldn't be read as JSON).`);
  }
  return parseExportFile(json);
}
