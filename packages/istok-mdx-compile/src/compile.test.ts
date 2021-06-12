import { compile } from './compile';

it('should be gucci', async () => {
  const result = await compile(`# hello`);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "compiledSource": "var M=Object.defineProperty,X=Object.defineProperties;var c=Object.getOwnPropertyDescriptors;var u=Object.getOwnPropertySymbols;var r=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;var s=(o,t,n)=>t in o?M(o,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[t]=n,p=(o,t)=>{for(var n in t||(t={}))r.call(t,n)&&s(o,n,t[n]);if(u)for(var n of u(t))a.call(t,n)&&s(o,n,t[n]);return o},y=(o,t)=>X(o,c(t));var D=(o,t)=>{var n={};for(var e in o)r.call(o,e)&&t.indexOf(e)<0&&(n[e]=o[e]);if(o!=null&&u)for(var e of u(o))t.indexOf(e)<0&&a.call(o,e)&&(n[e]=o[e]);return n};const layoutProps={},MDXLayout=\\"wrapper\\";function MDXContent(n){var e=n,{components:o}=e,t=D(e,[\\"components\\"]);return mdx(MDXLayout,y(p(p({},layoutProps),t),{components:o,mdxType:\\"MDXLayout\\"}),mdx(\\"h1\\",null,\\"hello\\"))}MDXContent.isMDXComponent=!0;
    ",
      "scope": Object {},
    }
  `);
});