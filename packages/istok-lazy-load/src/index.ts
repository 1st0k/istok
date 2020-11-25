export type AsyncLoadMap<T> = Record<string, () => Promise<T>>;
export type ResolvedMap<T> = Record<string, T>;

export async function loadMap<T>(map: AsyncLoadMap<T> | undefined): Promise<ResolvedMap<T>> {
  if (!map) {
    return {};
  }

  const keys = Object.keys(map);

  const promises: Array<Promise<T>> = keys.map(key => {
    return map[key]();
  });

  const result = await Promise.all(promises);

  return result.reduce<ResolvedMap<T>>((acc, curr, index) => {
    // indices of elements in result are the same as in original keys array
    // so we can get key corresponding to current element by index
    const key = keys[index];
    acc[key] = curr;
    return acc;
  }, {});
}

export type LoadMapLoader<T> = (element: string) => Promise<T>;

export function makeLoadMap<T>(elements: string[], loader: LoadMapLoader<T>) {
  return elements.reduce<AsyncLoadMap<T>>((acc, curr) => {
    acc[curr] = () => loader(curr);

    return acc;
  }, {});
}
