declare module '@mdx-js/react' {
  const Mdx: any;
  export const mdx: any;
  export const MDXProvider: any;
}

declare interface Window {
  requestIdleCallback(cb: Function): NodeJS.Timeout;
  cancelIdleCallback(id: NodeJS.Timeout): void;
}
