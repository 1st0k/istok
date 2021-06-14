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
      "compiledSource": "var d=Object.defineProperty;var r=Object.getOwnPropertySymbols;var p=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable;var c=(o,n,e)=>n in o?d(o,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[n]=e,a=(o,n)=>{for(var e in n||(n={}))p.call(n,e)&&c(o,e,n[e]);if(r)for(var e of r(n))s.call(n,e)&&c(o,e,n[e]);return o};var y=(o,n)=>{var e={};for(var t in o)p.call(o,t)&&n.indexOf(t)<0&&(e[t]=o[t]);if(o!=null&&r)for(var t of r(o))n.indexOf(t)<0&&s.call(o,t)&&(e[t]=o[t]);return e};const makeShortcode=o=>n=>(console.warn(\\"Component \`%s\` was not imported, exported, or provided by MDXProvider as global scope\\",o),mdx(mdx.Fragment,null,n.children)),Async=makeShortcode(\\"Async\\"),MDXLayout=\\"wrapper\\";function MDXContent(e){var t=e,{components:o}=t,n=y(t,[\\"components\\"]);return mdx(MDXLayout,a({components:o},n),mdx(\\"h1\\",null,\\"hey yo\\"),mdx(\\"p\\",null,mdx(Async,{parentName:\\"p\\",mdxType:\\"Async\\"},\\"LOL\\")))}MDXContent.isMDXComponent=!0;
    ",
      "contentHtml": "<h1>hey yo</h1><p><div>LOL</div></p>",
      "scope": Object {},
    }
  `);

  done();
});
