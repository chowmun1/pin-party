import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { Quiz } from '../types';
import { IndexedDbQuizRepository } from './IndexedDbQuizRepository';

const quiz = (id: string, createdAt: number): Quiz => ({
  id,
  title: `Quiz ${id}`,
  description: '',
  createdAt,
  photos: [{ id: `${id}-p`, imageBlob: new Blob(['x'], { type: 'image/jpeg' }), lat: 1, lng: 2 }],
});

describe('IndexedDbQuizRepository', () => {
  it('saves, lists (newest first), gets, updates and deletes', async () => {
    const repo = new IndexedDbQuizRepository(`test-${Math.random()}`);
    expect(await repo.listQuizzes()).toEqual([]);

    await repo.saveQuiz(quiz('a', 1));
    await repo.saveQuiz(quiz('b', 2));
    expect((await repo.listQuizzes()).map((q) => q.id)).toEqual(['b', 'a']);

    const a = await repo.getQuiz('a');
    expect(a?.title).toBe('Quiz a');
    expect(a?.photos[0].lat).toBe(1);

    await repo.saveQuiz({ ...quiz('a', 1), title: 'Renamed' });
    expect((await repo.getQuiz('a'))?.title).toBe('Renamed');
    expect(await repo.listQuizzes()).toHaveLength(2);

    await repo.deleteQuiz('a');
    expect(await repo.getQuiz('a')).toBeUndefined();
    expect((await repo.listQuizzes()).map((q) => q.id)).toEqual(['b']);
  });
});
