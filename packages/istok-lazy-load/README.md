# @istok/lazy-load

Load all objects from async map.

## loadMap<T>(map: AsyncLoadMap<T> | undefined): Promise<ResolvedMap<T>>

Aawits for all promises in the map. Maps structure of form:

```js
const map = {
  a: () => asyncLoadA(),
  b: () => asyncLoadB(),
};
```

to:

```js
const resolvedMap = {
  a: awaitedA,
  b: awaitedB,
};
```

Usage

```js
const map = {
  a: () => Promise.resolve('a is loaded'),
  b: () => Promise.resolve('b is loaded'),
};

const resolvedMap = await loadMap(map);
```

## makeLoadMap<T>(elements: string[], loader: (element: string) => Promise<T>)

Usefull for dynamic imports of an array of files when using Webpack. Webpack can not resolve dynamic imports without static first part in the path. This will throw an error:

```js
const PATH = '../components/';
const component = 'a';
import(PATH + component);
```

While this is okay:

```js
const component = 'a';
import('../components/' + component);
```

Usage:

```js
const map = makeLoadMap(['Button', 'Input'], component => import('../components/' + component).then(m => m.default));
```
