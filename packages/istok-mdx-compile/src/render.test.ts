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
      "compiledSource": "var u=Object.defineProperty,D=Object.defineProperties;var i=Object.getOwnPropertyDescriptors;var r=Object.getOwnPropertySymbols;var s=Object.prototype.hasOwnProperty,y=Object.prototype.propertyIsEnumerable;var p=(o,n,t)=>n in o?u(o,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[n]=t,c=(o,n)=>{for(var t in n||(n={}))s.call(n,t)&&p(o,t,n[t]);if(r)for(var t of r(n))y.call(n,t)&&p(o,t,n[t]);return o},a=(o,n)=>D(o,i(n));var d=(o,n)=>{var t={};for(var e in o)s.call(o,e)&&n.indexOf(e)<0&&(t[e]=o[e]);if(o!=null&&r)for(var e of r(o))n.indexOf(e)<0&&y.call(o,e)&&(t[e]=o[e]);return t};const makeShortcode=o=>function(t){return console.warn(\\"Component \\"+o+\\" was not imported, exported, or provided by MDXProvider as global scope\\"),mdx(\\"div\\",c({},t))},Async=makeShortcode(\\"Async\\"),layoutProps={},MDXLayout=\\"wrapper\\";function MDXContent(t){var e=t,{components:o}=e,n=d(e,[\\"components\\"]);return mdx(MDXLayout,a(c(c({},layoutProps),n),{components:o,mdxType:\\"MDXLayout\\"}),mdx(\\"h1\\",null,\\"hey yo\\"),mdx(Async,{mdxType:\\"Async\\"},\\"LOL\\"))}MDXContent.isMDXComponent=!0;
    ",
      "contentHtml": "<h1>hey yo</h1><div>LOL</div>",
      "scope": Object {},
    }
  `);

  done();
});
