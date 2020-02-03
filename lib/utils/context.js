// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import { Registration, Subscription } from 'autobahn'

function remove (ctx, type, what) {
    const obj = ctx._registry[type]
    const topic = Object.keys(obj).find(key => obj[key] === what)
    if (topic) {
        delete ctx._registry[type][topic]
    }
}

export default class Context {
    /**
     * @param {Connection} connection
     * @param {Vue} vm
     */
    constructor (connection, vm) {
        this._connection = connection
        this._vm = vm
        this._registry = {
            subscribe: {},
            register: {}
        }
    }

    async destroy () {
        const wait = []
        Object.values(this._registry.register).forEach((topic) => {
            wait.push(this.unregister(topic))
        })
        this._registry.register = {}
        Object.values(this._registry.subscribe).forEach((topic) => {
            wait.push(this.unsubscribe(topic))
        })
        this._registry.subscribe = {}
        await Promise.all(wait)
    }

    /**
     * @returns {Q.Promise<T>}
     */
    getSession () {
        return this._connection.getSession()
    }

    /**
     * @param {string} procedure
     * @param {array} args
     * @param {object} kwArgs
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    call (procedure, args = [], kwArgs = {}, options = {}) {
        return this._connection.call(procedure, args, kwArgs, options)
    }

    /**
     * @param {string} procedure
     * @param {callback} endpoint
     * @param {object} options
     * @returns {Q.Promise<Registration|Subscription>}
     */
    register (procedure, endpoint, options = {}) {
        const d = this._connection.defer()
        this._connection.register(procedure, endpoint, options).then((r) => {
            this._registry.register[procedure] = r
            d.resolve(r)
        }, d.reject)
        return d.promise
    }

    /**
     * @param {autobahn.Registration} registration
     * @returns {Q.Promise<T>}
     */
    unregister (registration) {
        remove(this, 'register', registration)
        return this._connection.unregister(registration)
    }

    /**
     * @param {string} topic
     * @param {array} args
     * @param {object} kwArgs
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    publish (topic, args = [], kwArgs = {}, options = {}) {
        options = {
            ...options,
            acknowledge: true
        }
        return this._connection.publish(topic, args, kwArgs, options)
    }

    /**
     * @param {string} topic
     * @param {callback} handler
     * @param {object} options
     * @returns {Q.Promise<T>}
     */
    subscribe (topic, handler, options = {}) {
        const d = this._connection.defer()
        this._connection.subscribe(topic, handler, options).then((s) => {
            this._registry.subscribe[topic] = s
            d.resolve(s)
        }, d.reject)
        return d.promise
    }

    /**
     * @param {autobahn.Subscription} subscription
     * @returns {Q.Promise<T>}
     */
    unsubscribe (subscription) {
        remove(this, 'subscribe', subscription)
        return this._connection.unsubscribe(subscription)
    }
}