declare module '@mdx-js/mdx' {
  declare function MDX(params: any, options: any): Promise<string>;

  export default MDX;
}

declare module '@mdx-js/react' {
  const Mdx: any;
  export const mdx: any;
  export const MDXProvider: any;
}

declare module '@babel/preset-env' {
  const BabelPresetEnv: any;
  export default BabelPresetEnv;
}

declare module '@babel/preset-react' {
  const BabelPresetReact: any;
  export default BabelPresetReact;
}
