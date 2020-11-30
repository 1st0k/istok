import { GLOBAL_INJECTED_DATA_KEY } from './common';

export function getGlobalInjectedData<T>(initialData: T): T {
  if (typeof window !== 'undefined') {
    const data: T = (window as any).GLOBAL_INJECTED_DATA_KEY;
    if (!data) {
      throw new Error(`Failed to get global injected by key "${GLOBAL_INJECTED_DATA_KEY}" data from "window" object.`);
    }
    return data;
  } else {
    return initialData;
  }
}
