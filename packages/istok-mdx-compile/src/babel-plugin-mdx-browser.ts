import { CallExpression, Identifier } from '@babel/types';
import { PluginObj } from '@babel/core';

function isCallableExpression(expression: unknown): expression is CallExpression {
  if (typeof (expression as CallExpression).callee !== 'undefined') {
    return true;
  }
  return false;
}

export default function BabelPluginMdxBrowser(): PluginObj {
  return {
    visitor: {
      // remove all imports, we will add these to scope manually
      ImportDeclaration(path) {
        path.remove();
      },
      // the `makeShortcode` template is nice for error handling but we
      // don't need it here as we are manually injecting dependencies
      VariableDeclaration(path) {
        // this removes the `makeShortcode` function
        if ((path.node.declarations[0].id as Identifier).name === 'makeShortcode') {
          path.remove();
        }

        // this removes any variable that is set using the `makeShortcode` function
        if (path.node && path.node.declarations && path.node.declarations[0] && path.node.declarations[0].init) {
          const expr = path.node.declarations[0].init;

          if (isCallableExpression(expr) && (expr.callee as Identifier).name === 'makeShortcode') {
            path.remove();
          }
        }
      },
    },
  };
}
