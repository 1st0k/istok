# istok

## Setup

TODO

## Workflows

### Add new package

1. Use `template-demo-core` package as a reference (package must include `package.json`,`tsconfig.json`and`src/index.ts`).
2. Run `yarn lerna bootstrap`.

### Publish

```sh
yarn lerna publish
```

Publish every changed package to registry. It will build packages before publish.

### Add dependency to a package

```sh
yarn lerna add <package> --scope=@<scoped/package>
```

### Build packages

```sh
yarn build
```
