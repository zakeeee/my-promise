import MyPromise from './my-promise';

describe('MyPromise', () => {
  test('order', async () => {
    const arr: number[] = [];
    const p1 = MyPromise.resolve()
      .then(() => {
        // #1
        arr.push(0);

        /*
        // 返回了一个 Promise 对象，有 then 方法，因此会调用它的 then，这里多一次 MicroTask
        // 并且当返回的是 Promise 对象时 v8 会把对 then 的调用放在一个 MicroTask 里，这里又多了一次 MicroTask
        // 所以返回 Promise.resolve(4) 相比返回 4 就会多两次 MicroTask
        queueMicrotask(() => {
          // #3
          MyPromise.resolve(4).then(() => {
            // #5
          });
        });
        */
        return MyPromise.resolve(4);
      })
      // 假设到这里返回的 Promise 对象叫做 A
      .then((res) => {
        // #7
        arr.push(res);
      });

    const p2 = MyPromise.resolve()
      .then(() => {
        // #2
        arr.push(1);
      })
      .then(() => {
        // #4
        arr.push(2);
      })
      .then(() => {
        // #6
        arr.push(3);
      })
      .then(() => {
        // #8
        arr.push(5);
      })
      .then(() => {
        // #9
        arr.push(6);
      });

    await Promise.all([p1, p2]);
    expect(arr).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
