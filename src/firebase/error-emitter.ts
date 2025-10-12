
import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We must use a declaration merge to type the EventEmitter
declare interface ErrorEventEmitter {
  on<E extends keyof ErrorEvents>(event: E, listener: ErrorEvents[E]): this;
  emit<E extends keyof ErrorEvents>(event: E, ...args: Parameters<ErrorEvents[E]>): boolean;
}

class ErrorEventEmitter extends EventEmitter {}

// Create a singleton instance of the event emitter
export const errorEmitter = new ErrorEventEmitter();
