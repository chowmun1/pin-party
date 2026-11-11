import { describe, expect, it } from 'vitest';
import type { Quiz } from '../types';
import { ImportError, parseExportFile, quizToExportFile } from './exportImport';

const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x10, 0x80, 0xfe]);

const sampleQuiz = (): Quiz => ({
  id: 'q1',
  title: 'Holiday snaps',
  description: 'Summer 2026',
  createdAt: 123,
  photos: [
    { id: 'p1', imageBlob: new Blob([bytes], { type: 'image/jpeg' }), lat: 48.85, lng: 2.35, caption: 'Hint' },
    { id: 'p2', imageBlob: new Blob([bytes], { type: 'image/png' }), lat: -33.86, lng: 151.21 },
  ],
});

describe('export → import round trip', () => {
  it('preserves data and image bytes, with fresh ids', async () => {
    const file = await quizToExportFile(sampleQuiz());
    const json = JSON.parse(JSON.stringify(file));
    const quiz = parseExportFile(json);

    expect(quiz.id).not.toBe('q1');
    expect(quiz.title).toBe('Holiday snaps');
    expect(quiz.description).toBe('Summer 2026');
    expect(quiz.photos).toHaveLength(2);
    expect(quiz.photos[0].caption).toBe('Hint');
    expect(quiz.photos[1].caption).toBeUndefined();
    expect(quiz.photos[1]).toMatchObject({ lat: -33.86, lng: 151.21 });
    expect(quiz.photos[1].imageBlob.type).toBe('image/png');
    expect(new Uint8Array(await quiz.photos[0].imageBlob.arrayBuffer())).toEqual(bytes);
  });

  it('records app name and format version', async () => {
    const file = await quizToExportFile(sampleQuiz());
    expect(file.kind).toBe('quiz-export');
    expect(file.formatVersion).toBe(1);
    expect(file.app).toBe('Pin Party');
  });
});

describe('import validation', () => {
  const valid = async () => JSON.parse(JSON.stringify(await quizToExportFile(sampleQuiz())));

  it.each([
    ['null', null],
    ['an array', []],
    ['a random object', { hello: 'world' }],
  ])('rejects %s', (_label, input) => {
    expect(() => parseExportFile(input)).toThrow(ImportError);
  });

  it('rejects newer format versions', async () => {
    const f = await valid();
    f.formatVersion = 99;
    expect(() => parseExportFile(f)).toThrow(/newer version/);
  });

  it('rejects missing title', async () => {
    const f = await valid();
    f.quiz.title = '  ';
    expect(() => parseExportFile(f)).toThrow(/no title/);
  });

  it('rejects empty photo list', async () => {
    const f = await valid();
    f.quiz.photos = [];
    expect(() => parseExportFile(f)).toThrow(/no photos/);
  });

  it('rejects out-of-range coordinates', async () => {
    const f = await valid();
    f.quiz.photos[1].lat = 123;
    expect(() => parseExportFile(f)).toThrow(/Photo 2 has an invalid answer location/);
  });

  it('rejects non-image mime types', async () => {
    const f = await valid();
    f.quiz.photos[0].mimeType = 'text/html';
    expect(() => parseExportFile(f)).toThrow(/not a supported image/);
  });

  it('rejects corrupted base64', async () => {
    const f = await valid();
    f.quiz.photos[0].imageBase64 = '***not base64***';
    expect(() => parseExportFile(f)).toThrow(/corrupted/);
  });
});
