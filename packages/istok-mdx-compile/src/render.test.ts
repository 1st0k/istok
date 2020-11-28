import { createElement, ElementType } from 'react';
import { render } from './render';

const mdxSource = `
# hey yo

<Async>LOL</Async>
`;

it('should transform code', async done => {
  const result = await render(mdxSource, {
    asyncComponents: {
      Async: () => Promise.resolve(({ children }: { children: ElementType }) => createElement('div', {}, children)),
    },
  });

  expect(result).toMatchInlineSnapshot(`
    Object {
      "compiledSource": "\\"use strict\\";

    function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

    function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

    function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

    /* @jsxRuntime classic */

    /* @jsx mdx */
    var layoutProps = {};
    var MDXLayout = \\"wrapper\\";

    function MDXContent(_ref) {
      var components = _ref.components,
          props = _objectWithoutProperties(_ref, [\\"components\\"]);

      return mdx(MDXLayout, _extends({}, layoutProps, props, {
        components: components,
        mdxType: \\"MDXLayout\\"
      }), mdx(\\"h1\\", null, \\"hey yo\\"), mdx(Async, {
        mdxType: \\"Async\\"
      }, \\"LOL\\"));
    }

    ;
    MDXContent.isMDXComponent = true;",
      "contentHtml": "<h1>hey yo</h1><div>LOL</div>",
      "scope": Object {},
    }
  `);

  done();
});
