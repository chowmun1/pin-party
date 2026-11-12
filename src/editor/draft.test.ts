import { describe, expect, it } from 'vitest';
import { draftFromQuiz, draftToQuiz, emptyDraft, moveItem, validateDraft, type DraftPhoto } from './draft';

const photo = (id: string, pinned = true): DraftPhoto => ({
  id,
  imageBlob: new Blob(['x']),
  caption: '',
  answerName: '',
  lat: pinned ? 10 : null,
  lng: pinned ? 20 : null,
});

describe('validateDraft', () => {
  it('requires a title and at least one photo', () => {
    const v = validateDraft(emptyDraft());
    expect(v.ok).toBe(false);
    expect(v.titleError).toBeDefined();
    expect(v.photosError).toMatch(/at least one/);
  });

  it('lists photos missing pins', () => {
    const d = { ...emptyDraft(), title: 'T', photos: [photo('a'), photo('b', false), photo('c', false)] };
    const v = validateDraft(d);
    expect(v.ok).toBe(false);
    expect(v.missingPins).toEqual(['b', 'c']);
    expect(v.photosError).toMatch(/2 photos/);
  });

  it('passes when complete', () => {
    const d = { ...emptyDraft(), title: 'T', photos: [photo('a')] };
    expect(validateDraft(d).ok).toBe(true);
  });

  it('treats whitespace-only title as missing', () => {
    const d = { ...emptyDraft(), title: '   ', photos: [photo('a')] };
    expect(validateDraft(d).ok).toBe(false);
  });
});

describe('draftToQuiz / draftFromQuiz', () => {
  it('round-trips and trims text, dropping empty captions', () => {
    const d = {
      ...emptyDraft(),
      title: '  Trip  ',
      description: ' desc ',
      photos: [{ ...photo('a'), caption: '  hint ', answerName: ' Lake Como ' }, photo('b')],
    };
    const q = draftToQuiz(d);
    expect(q.title).toBe('Trip');
    expect(q.description).toBe('desc');
    expect(q.photos[0].caption).toBe('hint');
    expect(q.photos[0].answerName).toBe('Lake Como');
    expect('answerName' in q.photos[1]).toBe(false);
    expect('caption' in q.photos[1]).toBe(false);
    const back = draftFromQuiz(q);
    expect(back.photos[1].caption).toBe('');
    expect(back.photos[0]).toMatchObject({ lat: 10, lng: 20 });
  });

  it('throws if a pin is missing', () => {
    expect(() => draftToQuiz({ ...emptyDraft(), title: 'x', photos: [photo('a', false)] })).toThrow();
  });
});

describe('moveItem', () => {
  it('moves items and clamps', () => {
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    expect(moveItem([1, 2, 3], 2, 0)).toEqual([3, 1, 2]);
    expect(moveItem([1, 2, 3], 1, 99)).toEqual([1, 3, 2]);
    expect(moveItem([1, 2, 3], 5, 0)).toEqual([1, 2, 3]);
  });

  it('does not mutate input', () => {
    const a = [1, 2, 3];
    moveItem(a, 0, 1);
    expect(a).toEqual([1, 2, 3]);
  });
});
