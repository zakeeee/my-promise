import promiseAPlusTests from 'promises-aplus-tests';
import MyPromise from './my-promise';

MyPromise.resolve()
  .then(() => {
    console.log(0);
    return MyPromise.resolve(4);
  })
  .then((res) => {
    console.log(res);
  });

MyPromise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(5);
  })
  .then(() => {
    console.log(6);
  });

const adapter = {
  deferred() {
    let resolve;
    let reject;
    const promise = new MyPromise((resolve1, reject1) => {
      resolve = resolve1;
      reject = reject1;
    });
    return {
      promise,
      resolve,
      reject,
    };
  },
};

// Run Promise/A+ tests
promiseAPlusTests(adapter, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('done');
});
