import { IPromise, IPromiseLike, Result } from './types';
import { isIPromiseLike } from './utils';

export default class MyPromise<T> implements IPromise<T> {
  private state: 'pending' | 'settled' = 'pending';
  private result?: Result<T>;

  private onFulfilledCallbacks: ((value: T) => void)[] = [];
  private onRejectedCallbacks: ((reason: any) => void)[] = [];

  static resolve(): MyPromise<void>;
  static resolve<T>(value: T | IPromiseLike<T>): MyPromise<T>;
  static resolve<T>(value?: T | IPromiseLike<T>): MyPromise<any> {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason?: any): MyPromise<never> {
    return new MyPromise<never>((_, reject) => {
      reject(reason);
    });
  }

  private setState(state: 'fulfilled', value: T | undefined): void;
  private setState(state: 'rejected', reason: any): void;
  private setState(state: 'fulfilled' | 'rejected', arg: any): void {
    this.state = 'settled';
    if (state === 'fulfilled') {
      this.result = {
        state,
        value: arg,
      };
      const { onFulfilledCallbacks } = this;
      this.onFulfilledCallbacks = [];
      onFulfilledCallbacks.forEach((cb) => {
        queueMicrotask(() => {
          cb(arg);
        });
      });
    } else {
      this.result = {
        state,
        reason: arg,
      };
      const { onRejectedCallbacks } = this;
      this.onRejectedCallbacks = [];
      onRejectedCallbacks.forEach((cb) => {
        queueMicrotask(() => {
          cb(arg);
        });
      });
    }
  }

  constructor(
    executor: (resolve: (value: T | IPromiseLike<T>) => void, reject: (reason: any) => void) => any
  ) {
    const resolve = (value: T | IPromiseLike<T>) => {
      if (this.state === 'settled') {
        return;
      }

      if (isIPromiseLike(value)) {
        // IPromiseLike
        value.then(
          (val) => {
            this.setState('fulfilled', val);
          },
          (err) => {
            this.setState('rejected', err);
          }
        );
      } else {
        this.setState('fulfilled', value);
      }
    };

    const reject = (reason?: any) => {
      if (this.state === 'settled') {
        return;
      }

      this.setState('rejected', reason);
    };

    executor(resolve, reject);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | IPromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | IPromiseLike<TResult2>) | undefined | null
  ): MyPromise<TResult1 | TResult2> {
    return new MyPromise((resolve, reject) => {
      const { result } = this;
      if (result) {
        queueMicrotask(() => {
          if (result.state === 'fulfilled') {
            resolve(onfulfilled ? onfulfilled(result.value) : result.value);
          } else {
            reject(onrejected ? onrejected(result.reason) : result.reason);
          }
        });
        return;
      }
      this.onFulfilledCallbacks.push((value) => resolve(onfulfilled ? onfulfilled(value) : value));
      this.onRejectedCallbacks.push((reason) => reject(onrejected ? onrejected(reason) : reason));
    });
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | IPromiseLike<TResult>) | undefined | null
  ): MyPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
}
