import { FirestorePermissionError } from './errors';

type ErrorListener = (error: FirestorePermissionError) => void;

class ErrorEmitter {
  private listeners: Set<ErrorListener> = new Set();

  on(event: 'permission-error', listener: ErrorListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: 'permission-error', error: FirestorePermissionError) {
    this.listeners.forEach((l) => l(error));
  }
}

export const errorEmitter = new ErrorEmitter();