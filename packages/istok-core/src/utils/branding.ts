export type Brand<T, B> = T & { __brand__: B } & { __base__: T };

export type AnyBrand = Brand<unknown, unknown>;

export type BaseOf<B extends AnyBrand> = B['__base__'];

export type Brander<B extends AnyBrand> = (base: BaseOf<B>) => B;

export const identity = <B extends AnyBrand>(base: BaseOf<B>) => base as B;

export const make = <B extends AnyBrand>(): Brander<B> => identity;

export const unwrap = <B extends AnyBrand>(b: B) => b as BaseOf<B>;
