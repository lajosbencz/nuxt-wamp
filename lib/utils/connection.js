import autobahn from 'autobahn'

const defaultOptions = {
    debug: false,
    wamp_close_timeout: 100
}

/**
 * @param {Connection} connection
 * @param {string} method
 * @param {array} args
 * @returns {Q.Promise<T>}
 */
function deferredSessionCall (connection, method, args) {
    const d = connection.defer()
    debounceClose(connection, -1)
    connection.getSession().then((session) => {
        session[method](...args)
            .then(d.resolve, d.reject, d.progress)
            .finally(() => {
                debounceClose(connection)
            })
    }, (...args) => {
        d.reject(...args)
        debounceClose(connection)
    })
    return d.promise
}

/**
 * @param {Connection} connection
 * @param {int} timeout
 */
function debounceClose (connection, timeout = 0) {
    if (process.client) {
        return
    }
    if (timeout < 0) {
        if (connection._wampCloseTimeout) {
            clearTimeout(connection._wampCloseTimeout)
        }
        return
    }
    if (timeout === 0) {
        timeout = connection._options.wamp_close_timeout
    }
    if (connection._wampCloseTimeout) {
        clearTimeout(connection._wampCloseTimeout)
    }
    connection._wampCloseTimeout = setTimeout(() => {
        connection.close()
    }, timeout)
}

export default class Connection extends autobahn.Connection {
    constructor (options) {
        options = { ...defaultOptions, ...options }
        super(options)

        this._wampSession = null
        this._wampSessionDefer = null
        this._wampCloseTimeout = null
        this._wampClosed = false

        this.onopen = function (session, details) {
            if (this._wampSessionDefer) {
                this._wampSessionDefer.resolve(session, details)
            }
        }

        this.onclose = function (reason, details) {
            if (this._wampSessionDefer) {
                this._wampSessionDefer.reject(reason || 'closed', details)
            }
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
        try {
            super.close()
        } catch (e) {
        }
    }

    /**
     * @returns {Q.Promise<T>}
     */
    getSession () {
        if (!this._wampSession) {
            setTimeout(() => this.open(), 1)
        }
        if (!this._wampSessionDefer) {
            this._wampSessionDefer = this.defer()
        }
        return this._wampSessionDefer.promise
    }

    /**
     * @param {string} procedure
     * @param {array} args
     * @param {object} kwArgs
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    call (procedure, args, kwArgs, options) {
        return deferredSessionCall(this, 'call', [procedure, args, kwArgs, options])
    }

    /**
     * @param {string} procedure
     * @param {callback} endpoint
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    register (procedure, endpoint, options) {
        return deferredSessionCall(this, 'register', [procedure, endpoint, options])
    }

    /**
     * @param {autobahn.Registration} registration
     * @returns {Q.Promise<T>}
     */
    unregister (registration) {
        return deferredSessionCall(this, 'unregister', [registration])
    }

    /**
     * @param {string} topic
     * @param {array} args
     * @param {object} kwArgs
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    publish (topic, args, kwArgs, options) {
        options = {
            ...options,
            acknowledge: true
        }
        return deferredSessionCall(this, 'publish', [topic, args, kwArgs, options])
    }

    /**
     * @param {string} topic
     * @param {callback} handler
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    subscribe (topic, handler, options) {
        return deferredSessionCall(this, 'subscribe', [topic, handler, options])
    }

    /**
     * @param {autobahn.Subscription} subscription
     * @returns {Q.Promise<T>}
     */
    unsubscribe (subscription) {
        return deferredSessionCall(this, 'unsubscribe', [subscription])
    }
}
