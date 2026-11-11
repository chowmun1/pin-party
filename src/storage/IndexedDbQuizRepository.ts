import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Quiz } from '../types';
import { StorageError, StorageQuotaError, type QuizRepository } from './QuizRepository';

interface PinPartyDB extends DBSchema {
  quizzes: { key: string; value: Quiz };
}

const DB_NAME = 'pin-party';
const DB_VERSION = 1;

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof DOMException) && !(err instanceof Error)) return false;
  return (
    err.name === 'QuotaExceededError' ||
    // Older Firefox
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    (err instanceof DOMException && err.code === 22)
  );
}

function wrap(err: unknown, action: string): Error {
  if (isQuotaError(err)) return new StorageQuotaError();
  const detail = err instanceof Error ? err.message : String(err);
  return new StorageError(`Could not ${action}: ${detail}`, { cause: err });
}

export class IndexedDbQuizRepository implements QuizRepository {
  private dbPromise: Promise<IDBPDatabase<PinPartyDB>> | null = null;

  constructor(private readonly dbName: string = DB_NAME) {}

  private db(): Promise<IDBPDatabase<PinPartyDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<PinPartyDB>(this.dbName, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('quizzes')) {
            db.createObjectStore('quizzes', { keyPath: 'id' });
          }
        },
      }).catch((err) => {
        this.dbPromise = null; // allow retry
        throw wrap(err, 'open browser storage (is private browsing blocking it?)');
      });
    }
    return this.dbPromise;
  }

  async listQuizzes(): Promise<Quiz[]> {
    try {
      const all = await (await this.db()).getAll('quizzes');
      return all.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      throw wrap(err, 'load quizzes');
    }
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    try {
      return await (await this.db()).get('quizzes', id);
    } catch (err) {
      throw wrap(err, 'load quiz');
    }
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    try {
      const db = await this.db();
      const tx = db.transaction('quizzes', 'readwrite');
      await Promise.all([tx.store.put(quiz), tx.done]);
    } catch (err) {
      throw wrap(err, 'save quiz');
    }
  }

  async deleteQuiz(id: string): Promise<void> {
    try {
      await (await this.db()).delete('quizzes', id);
    } catch (err) {
      throw wrap(err, 'delete quiz');
    }
  }
}
