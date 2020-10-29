export function assertType<T>(arg: unknown, target: T): asserts arg is typeof target {
  if (typeof arg !== typeof target) {
    throw new Error(`Type mismatch: expected "${typeof target}", but got "${typeof arg}".`);
  }
}

export function assertNumber(arg: unknown): asserts arg is number {
  return assertType(arg, 0);
}

export function assertString(arg: unknown): asserts arg is string {
  return assertType(arg, '');
}
