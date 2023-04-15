import MyPromise from './my-promise';

describe('MyPromise', () => {
  test('order', async () => {
    const arr: number[] = [];
    const p1 = MyPromise.resolve()
      .then(() => {
        arr.push(0);
        return MyPromise.resolve(4);
      })
      .then((res) => {
        arr.push(res);
      });

    const p2 = MyPromise.resolve()
      .then(() => {
        arr.push(1);
      })
      .then(() => {
        arr.push(2);
      })
      .then(() => {
        arr.push(3);
      })
      .then(() => {
        arr.push(5);
      })
      .then(() => {
        arr.push(6);
      });

    await Promise.all([p1, p2]);
    expect(arr).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
