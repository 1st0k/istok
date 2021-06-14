import { compile } from './compile';

it('should be gucci', async () => {
  const result = await compile(`# hello`);
  expect(result).toMatchInlineSnapshot(`
    Object {
      "compiledSource": "var a=Object.defineProperty;var r=Object.getOwnPropertySymbols;var u=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable;var D=(n,o,t)=>o in n?a(n,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[o]=t,M=(n,o)=>{for(var t in o||(o={}))u.call(o,t)&&D(n,t,o[t]);if(r)for(var t of r(o))p.call(o,t)&&D(n,t,o[t]);return n};var X=(n,o)=>{var t={};for(var e in n)u.call(n,e)&&o.indexOf(e)<0&&(t[e]=n[e]);if(n!=null&&r)for(var e of r(n))o.indexOf(e)<0&&p.call(n,e)&&(t[e]=n[e]);return t};const MDXLayout=\\"wrapper\\";function MDXContent(t){var e=t,{components:n}=e,o=X(e,[\\"components\\"]);return mdx(MDXLayout,M({components:n},o),mdx(\\"h1\\",null,\\"hello\\"))}MDXContent.isMDXComponent=!0;
    ",
      "scope": Object {},
    }
  `);
});
