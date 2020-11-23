import { ElementType } from 'react';

export type AsyncComponentsLoadConfig = Record<string, () => Promise<ElementType>>;

export async function loadComponents(config: AsyncComponentsLoadConfig | undefined) {
  const components = config;

  if (!components) {
    return {};
  }

  const promisedComponentsNames = Object.keys(components);

  const awaitedComponents: Array<Promise<ElementType>> = promisedComponentsNames.map(name => {
    return components[name]();
  });

  try {
    const result = await Promise.all(awaitedComponents);
    return result.reduce<Record<string,ElementType>>((acc, curr, index) => {
      acc[promisedComponentsNames[index]] = curr;
      return acc;
    }, {});
  } catch (e) {
    console.log(`Failed to load components:\n`, e);
    return {};
  }
}
