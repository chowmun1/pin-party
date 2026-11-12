import type { Quiz } from '../types';

/**
 * Storage abstraction for quizzes. The UI only talks to this interface, so the
 * IndexedDB implementation can later be swapped for a cloud backend
 * (Supabase, Firebase, ...) without touching components.
 */
export interface QuizRepository {
  listQuizzes(): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  /** Insert or replace a quiz (matched by id). */
  saveQuiz(quiz: Quiz): Promise<void>;
  deleteQuiz(id: string): Promise<void>;
}

/** Thrown when the browser refuses to store more data. */
export class StorageQuotaError extends Error {
  constructor() {
    super(
      'Your browser has run out of storage space for this site. ' +
        'Try deleting old quizzes or using fewer/smaller photos, then save again.',
    );
    this.name = 'StorageQuotaError';
  }
}

/** Thrown for any other storage failure, with a human-readable message. */
export class StorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'StorageError';
  }
}
