import { jsxAttribute, jsxIdentifier, stringLiteral, JSXOpeningElement, JSXAttribute } from '@babel/types';
import { PluginObj } from '@babel/core';

export const RESOURCE_NAME_ATTRIBUTE = 'data-istok-resource';

interface BabelPluginIstokResoruceParams {
  resourceToURL(resourceLocation: string): string;
}

export default function createBabelPluginIstokResource({ resourceToURL }: BabelPluginIstokResoruceParams) {
  return function BabelPluginIstokResoruce(): PluginObj {
    return {
      name: 'istok resource',
      visitor: {
        JSXAttribute(path) {
          if (path?.node?.name?.name === RESOURCE_NAME_ATTRIBUTE) {
            const resourceLocator = (path?.node?.value as any)?.value;
            const attributes = (path.parent as JSXOpeningElement).attributes;
            // do not replace already defined "src", or should we?
            if (attributes.findIndex((attr: unknown) => (attr as JSXAttribute)?.name?.name === 'src') === -1) {
              attributes.push(jsxAttribute(jsxIdentifier('src'), stringLiteral(resourceToURL(resourceLocator))));
            }
          }
        },
      },
    };
  };
}
