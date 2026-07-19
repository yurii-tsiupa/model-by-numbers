type BaseColorListener = (baseColor: string) => void;
const listeners = new Set<BaseColorListener>();

export function subscribeToBaseColorSynchronization(listener: BaseColorListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function requestBaseColorSynchronization(baseColor: string): void {
  listeners.forEach((listener) => listener(baseColor));
}
