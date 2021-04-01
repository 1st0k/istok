/**
 * @jest-environment jsdom
 */

const rtlRender = require('@testing-library/react').render;

const { render } = require('../render');

it('should accept custom renderer', async done => {
  const mdxSourceStyled = `
# hey yo
`;

  const result = await render(mdxSourceStyled, {
    renderer(root) {
      return rtlRender(root).container;
    },
  });

  expect(result.contentHtml).toMatchInlineSnapshot(`
    <div>
      <h1>
        hey yo
      </h1>
    </div>
  `);

  done();
});
