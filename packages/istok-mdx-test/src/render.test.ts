import { render } from '@istok/mdx-compile';

const source = `
# header

<div>{value}</div>
`;

test('renders with scoped values', async () => {
  const { compiledSource, contentHtml } = await render(source, {
    scope: {
      value: 420,
    },
  });

  expect(compiledSource).toMatchInlineSnapshot(`
    "\\"use strict\\";

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
      }), mdx(\\"h1\\", null, \\"header\\"), mdx(\\"div\\", null, value));
    }

    ;
    MDXContent.isMDXComponent = true;"
  `);
  expect(contentHtml).toMatchInlineSnapshot(`"<h1>header</h1><div>420</div>"`);
});