export interface IPromiseLike<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | IPromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | IPromiseLike<TResult2>) | undefined | null
  ): IPromiseLike<TResult1 | TResult2>;
}

export interface IPromise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | IPromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | IPromiseLike<TResult2>) | undefined | null
  ): IPromise<TResult1 | TResult2>;

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | IPromiseLike<TResult>) | undefined | null
  ): IPromise<T | TResult>;
}

export enum MyPromiseState {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}
