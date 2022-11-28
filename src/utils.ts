import { IPromiseLike } from './types';

export function isObject(value: unknown): value is Object {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function isIPromiseLike<T>(
  value: T | IPromiseLike<T> | undefined
): value is IPromiseLike<T> {
  return isObject(value) && typeof value.then === 'function';
}
