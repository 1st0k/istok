export type AsyncComponentsLoadConfig = Record<string, () => Promise<React.ComponentType>>;

export async function loadComponents(config: AsyncComponentsLoadConfig | undefined) {
  const components = config;

  if (!components) {
    return {};
  }

  const promisedComponentsNames = Object.keys(components);

  const awaitedComponents: Array<Promise<React.ComponentType>> = promisedComponentsNames.map(name => {
    return components[name]();
  });

  try {
    const result = await Promise.all(awaitedComponents);
    return result;
  } catch (e) {
    console.log(`Failed to load components:\n`, e);
    return {};
  }
}
