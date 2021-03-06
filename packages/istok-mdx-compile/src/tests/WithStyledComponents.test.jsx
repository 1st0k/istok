/**
 * @jest-environment jsdom
 */

const { createElement } = require('react');

const styled = require('styled-components').default;
const { ServerStyleSheet } = require('styled-components');
const { render } = require('../render');

require('jest-styled-components');

it('should extract the CSS and render content HTML', async () => {
  const Title = styled.h1`
    font-size: 1.5em;
    text-align: center;
    color: palevioletred;
  `;

  const mdxSourceStyled = `
# hey yo

<Title>styled title</Title>

<Async>LOL</Async>
`;

  const sheet = new ServerStyleSheet();
  let css;

  const { contentHtml } = await render(mdxSourceStyled, {
    asyncComponents: {
      Async: () => Promise.resolve(({ children }) => createElement('div', {}, children)),
    },
    components: {
      Title,
    },
    enhanceRoot(root) {
      const result = sheet.collectStyles(root);

      return result;
    },
    postRender() {
      css = sheet.getStyleTags();
      sheet.seal();
    },
  });

  expect(contentHtml).toMatchInlineSnapshot(
    `"<h1>hey yo</h1><p><h1 class=\\"sc-bdfBwQ hSHKCF\\">styled title</h1></p><p><div>LOL</div></p>"`
  );
  expect(css).toMatchInlineSnapshot(`
    "<style data-styled=\\"true\\" data-styled-version=\\"5.2.1\\">.hSHKCF{font-size:1.5em;text-align:center;color:palevioletred;}/*!sc*/
    data-styled.g1[id=\\"sc-bdfBwQ\\"]{content:\\"hSHKCF,\\"}/*!sc*/
    </style>"
  `);
});
