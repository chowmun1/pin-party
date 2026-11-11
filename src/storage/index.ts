import { IndexedDbQuizRepository } from './IndexedDbQuizRepository';
import type { QuizRepository } from './QuizRepository';

export * from './QuizRepository';

/**
 * The repository the app uses. To move to a cloud backend, implement
 * QuizRepository for it and change this one line.
 */
export const quizRepository: QuizRepository = new IndexedDbQuizRepository();
