import promiseAPlusTests from 'promises-aplus-tests';
import MyPromise from './my-promise';

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
