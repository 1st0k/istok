/**
 * @jest-environment jsdom
 */

const { createContext, createElement } = require('react');

const { render } = require('../render');

it('should enhance with provider', async done => {
  const mdxSourceStyled = `<Test />`;

  const TestContext = createContext(null);

  const Test = () => createElement(TestContext.Consumer, null, value => createElement('p', null, value));

  const result = await render(mdxSourceStyled, {
    enhanceRoot(root) {
      return createElement(TestContext.Provider, { value: 'value from context' }, root);
    },
    components: {
      Test,
    },
  });

  expect(result.contentHtml).toMatchInlineSnapshot(`"<p>value from context</p>"`);

  done();
});
