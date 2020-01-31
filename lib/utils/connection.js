import autobahn from 'autobahn'

import defer from './defer'

const defaultOptions = {
    debug: false,
    use_es6_promises: true,
    wamp_close_timeout: 100,
}

async function deferredSessionCall (ctx, method, args) {
    debounceClose()
    try {
        if (!ctx._wampSessionDefer) {
            ctx._wampSessionDefer = defer()
            ctx.open()
        }
        let session
        if (ctx._wampSession) {
            session = ctx._wampSession
        } else {
            session = await ctx._wampSessionDefer.promise
        }
        const res = await session[method](...args)
        debounceClose(ctx)
        return res
    } catch (e) {
        debounceClose(ctx)
        throw e
    }
}

let debounceTimeout = null

function debounceClose (ctx) {
    if (process.client) {
        return
    }
    if (!ctx) {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout)
        }
        return
    }
    if (debounceTimeout) {
        clearTimeout(debounceTimeout)
    }
    debounceTimeout = setTimeout(() => {
        ctx.close()
    }, ctx._options.wamp_close_timeout)
}

export default class Connection extends autobahn.Connection {
    constructor (options) {
        options = { ...defaultOptions, ...options }
        super(options)

        this._wampSession = null
        this._wampSessionDefer = null
        this._wampClosed = false

        this.onopen = function (session, details) {
            this._wampSessionDefer.resolve(session, details)
        }

        this.onclose = function (reason, details) {
            // this._wampSessionDefer.reject(reason, details)
            this._wampSessionDefer = null
            this._wampSession = null
        }

        // this.open();
    }

    open () {
        this._wampClosed = false
        super.open()
    }

    close () {
        this._wampClosed = true
        super.close()
    }

    call (procedure, args, kwArgs, options) {
        return deferredSessionCall(this, 'call', [procedure, args, kwArgs, options])
    }

    register (procedure, endpoint, options) {
        return deferredSessionCall(this, 'register', [procedure, endpoint, options])
    }

    subscribe (topic, handler, options) {
        return deferredSessionCall(this, 'subscribe', [topic, handler, options])
    }

    publish (topic, args, kwArgs, options) {
        options = {
            ...options,
            acknowledge: true
        }
        return deferredSessionCall(this, 'publish', [topic, args, kwArgs, options])
    }
}
