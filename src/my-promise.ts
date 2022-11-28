import { IPromise, IPromiseLike, MyPromiseState } from './types';

const resolvePromise = <T>(
  value: T | IPromiseLike<T>,
  resolve: (value: T) => void,
  reject: (reason: any) => void,
  pendingPromise: MyPromise<any>
) => {
  if (value === pendingPromise) {
    reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
    return;
  }

  if ((typeof value === 'object' && value !== null) || typeof value === 'function') {
    // 如果 value 是 Object 或 Function 需要取出 then 方法执行
    let then: unknown;
    try {
      then = (value as any).then;
    } catch (error) {
      reject(error);
      return;
    }

    // then 不是函数直接 resolve
    if (typeof then !== 'function') {
      resolve(value as T);
      return;
    }

    let flag = false; // 表示 onfulfilled 或 onrejected 已经执行了
    try {
      then.call(
        value,
        (val) => {
          if (!flag) {
            flag = true;
            resolvePromise(val, resolve, reject, pendingPromise);
          }
        },
        (err) => {
          if (!flag) {
            flag = true;
            reject(err);
          }
        }
      );
    } catch (error) {
      if (!flag) {
        reject(error);
      }
    }
  } else {
    resolve(value);
  }
};

export default class MyPromise<T> implements IPromise<T> {
  private state = MyPromiseState.PENDING;
  private value?: T = undefined;
  private reason: any = undefined;

  // 一个 Promise 可以有多个 Subscription，所以要用数组存
  private onFulfilledCallbacks: ((value: T) => void)[] = [];
  private onRejectedCallbacks: ((reason: any) => void)[] = [];

  static resolve(): MyPromise<void>;
  static resolve<T>(value: T | IPromiseLike<T>): MyPromise<T>;
  static resolve<T>(value?: T | IPromiseLike<T>): MyPromise<any> {
    // 如果 value 是一个 MyPromise 对象，直接返回它
    if (value instanceof MyPromise) {
      return value;
    }

    // 如果不是，新建一个 MyPromise 对象，resolve value
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
    const { onFulfilledCallbacks, onRejectedCallbacks } = this;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    if (state === 'fulfilled') {
      this.state = MyPromiseState.FULFILLED;
      this.value = arg;
      onFulfilledCallbacks.forEach((cb) => {
        cb(arg);
      });
    } else {
      this.state = MyPromiseState.REJECTED;
      this.reason = arg;
      onRejectedCallbacks.forEach((cb) => {
        cb(arg);
      });
    }
  }

  constructor(
    executor: (resolve: (value: T | IPromiseLike<T>) => void, reject: (reason: any) => void) => any
  ) {
    const resolve = (value: T | IPromiseLike<T>) => {
      if (this.state !== MyPromiseState.PENDING) {
        return;
      }
      resolvePromise(
        value,
        (val) => {
          this.setState('fulfilled', val);
        },
        reject,
        this
      );
    };

    const reject = (reason?: any) => {
      if (this.state !== MyPromiseState.PENDING) {
        return;
      }

      this.setState('rejected', reason);
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | IPromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | IPromiseLike<TResult2>) | undefined | null
  ): MyPromise<TResult1 | TResult2> {
    const _onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : (value: T) => value;
    const _onrejected =
      typeof onrejected === 'function'
        ? onrejected
        : (reason: any) => {
            throw reason;
          };

    const newPromise = new MyPromise((resolve, reject) => {
      const handleFulfilled = (value: T) => {
        queueMicrotask(() => {
          try {
            const ret = _onfulfilled(value);
            resolvePromise(ret, resolve, reject, newPromise);
          } catch (error) {
            reject(error);
          }
        });
      };

      const handleRejected = (reason: any) => {
        queueMicrotask(() => {
          try {
            const ret = _onrejected(reason);
            resolvePromise(ret, resolve, reject, newPromise);
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.state === MyPromiseState.FULFILLED) {
        handleFulfilled(this.value!);
      } else if (this.state === MyPromiseState.REJECTED) {
        handleRejected(this.reason);
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return newPromise;
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | IPromiseLike<TResult>) | undefined | null
  ): MyPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
}
