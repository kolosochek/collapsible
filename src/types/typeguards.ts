// type guard for undefined
export function isUndefined(value: any): value is undefined {
  return typeof value === "undefined";
}

// type guard for null
export function isNull(value: any): value is null {
  return value === null;
}

// type guard for function
export function isFunction(value: any): value is Function {
  return typeof value === "function";
}
