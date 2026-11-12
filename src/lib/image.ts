import { IMAGE_JPEG_QUALITY, IMAGE_MAX_DIMENSION } from '../config';
import type { LatLng } from '../types';

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

const MAX_INPUT_BYTES = 60 * 1024 * 1024; // 60 MB
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?)$/i;

export function looksLikeImage(file: File): boolean {
  return file.type.startsWith('image/') || (!file.type && IMAGE_EXT.test(file.name));
}

/** Reads GPS coordinates from a photo's EXIF data, if present and sane. */
export async function readGpsFromFile(file: File): Promise<LatLng | undefined> {
  try {
    // Loaded on demand: exifr is large and only needed when uploading photos.
    const { gps } = await import('exifr');
    const result = await gps(file);
    if (!result) return undefined;
    const { latitude: lat, longitude: lng } = result;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
    if (lat === 0 && lng === 0) return undefined; // usually a camera with no fix
    return { lat, lng };
  } catch {
    return undefined; // no EXIF / unsupported format: not an error
  }
}

interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function decode(file: File): Promise<Decoded> {
  // createImageBitmap applies EXIF orientation so portrait phone photos stay upright.
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() };
    } catch {
      /* fall back to <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new ImageProcessingError(
      `"${file.name}" couldn't be opened. It may be corrupted or in a format this browser can't read (e.g. HEIC on some browsers — try JPEG).`,
    );
  }
  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    release: () => URL.revokeObjectURL(url),
  };
}

/** Downscales an image so its longest side is at most IMAGE_MAX_DIMENSION, re-encoded as JPEG. */
export async function downscaleImage(file: File): Promise<Blob> {
  const img = await decode(file);
  try {
    const { width, height } = img;
    if (!width || !height) throw new ImageProcessingError(`"${file.name}" has no image data.`);
    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new ImageProcessingError('Your browser could not process the image.');
    ctx.fillStyle = '#ffffff'; // JPEG has no transparency
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img.source, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', IMAGE_JPEG_QUALITY),
    );
    if (!blob) throw new ImageProcessingError(`"${file.name}" is too large for this device to process.`);
    return blob;
  } finally {
    img.release();
  }
}

export interface ProcessedImage {
  blob: Blob;
  gps?: LatLng;
}

/**
 * Validates, reads GPS from, and downscales one uploaded file.
 * Note: re-encoding strips EXIF, so the stored image never leaks the location.
 */
export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (!looksLikeImage(file)) throw new ImageProcessingError(`"${file.name}" isn't an image file.`);
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageProcessingError(`"${file.name}" is too big (over 60 MB).`);
  }
  const location = await readGpsFromFile(file);
  const blob = await downscaleImage(file);
  return { blob, ...(location ? { gps: location } : {}) };
}
