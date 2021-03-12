export type AsyncLoadMap<T, K extends string = string> = Record<K, () => Promise<T>>;
export type ResolvedMap<T, K extends string = string> = Record<K, T>;

export async function loadMap<T, K extends string = string>(
  map: AsyncLoadMap<T, K> | undefined
): Promise<ResolvedMap<T, K>> {
  if (!map) {
    return {} as any;
  }

  const keys = Object.keys(map) as K[];

  const promises: Array<Promise<T>> = keys.map(key => {
    return map[key]();
  });

  const result = await Promise.all(promises);

  return result.reduce<ResolvedMap<T, K>>((acc, curr, index) => {
    // indices of elements in result are the same as in original keys array
    // so we can get key corresponding to current element by index
    const key = keys[index];
    acc[key] = curr;
    return acc;
  }, {} as any);
}

export type LoadMapLoader<T> = (element: string) => Promise<T>;

export function makeLoadMap<T, K extends string = string>(elements: K[], loader: LoadMapLoader<T>) {
  return elements.reduce<AsyncLoadMap<T, K>>((acc, curr) => {
    acc[curr] = () => loader(curr);

    return acc;
  }, {} as any);
}
