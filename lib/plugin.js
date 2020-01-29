const autobahn = require('autobahn');

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

async function deferredSessionCall(ctx, method, args) {
  debounceClose();
  try {
    if (!ctx._wampSessionDefer) {
      ctx._wampSessionDefer = defer();
      ctx.open();
    }
    let session;
    if (ctx._wampSession) {
      session = ctx._wampSession;
    } else {
      session = await ctx._wampSessionDefer.promise;
    }
    let res = await session[method](...args);
    debounceClose(ctx);
    return res;
  } catch (e) {
    debounceClose(ctx);
    throw e;
  }
}

let debounceTimeout = null;

function debounceClose(ctx) {
  if (process.client) {
    return;
  }
  if (!ctx) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    return;
  }
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(() => {
    ctx.close();
  }, ctx._options.wamp_close_timeout);
}

const defaultOptions = {
  debug: false,
  use_es6_promises: true,
  wamp_close_timeout: 100,
};

class Connection extends autobahn.Connection {
  constructor(options) {
    options = {...defaultOptions, ...options};
    super(options);

    this._wampSession = null;
    this._wampSessionDefer = null;
    this._wampClosed = false;

    this.onopen = function (session, details) {
      this._wampSessionDefer.resolve(session, details);
    };

    this.onclose = function (reason, details) {
      this._wampSessionDefer.reject(reason, details);
      this._wampSessionDefer = null;
      this._wampSession = null;
    };

    //this.open();
  }

  open() {
    this._wampClosed = false;
    super.open();
  }

  close() {
    this._wampClosed = true;
    super.close();
  }

  async call(procedure, args, kwArgs, options) {
    return await deferredSessionCall(this, 'call', [procedure, args, kwArgs, options]);
  }

  async register(procedure, endpoint, options) {
    return await deferredSessionCall(this, 'register', [procedure, endpoint, options]);
  }

  async subscribe(topic, handler, options) {
    return await deferredSessionCall(this, 'subscribe', [topic, handler, options]);
  }

  async publish(topic, args, kwArgs, options) {
    options = {...options, acknowledge: true};
    return await deferredSessionCall(this, 'publish', [topic, args, kwArgs, options]);
  }

}

function NuxtWampPlugin(context, inject) {

  let options = JSON.parse('<%= JSON.stringify(options) %>');
  if (process.server) {
    options.max_retries = 0;
    options.ssr = true;
  }

  const connection = new Connection(options);
  inject('wamp', connection);

}

module.exports = NuxtWampPlugin;
