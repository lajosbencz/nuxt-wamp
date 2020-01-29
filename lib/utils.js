function defer() {
  return (() => {
    let resolve = null;
    let reject = null;
    let promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return {
      promise,
      reject,
      resolve
    };
  })();
}

module.exports = {
  defer,
};
