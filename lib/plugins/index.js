import Vue from 'vue'
import Connection from '../utils/connection.js'

import '../middleware'
import Context from '../utils/context'

const options = JSON.parse('<%= JSON.stringify(options) %>')
const { namespace } = options
const injectKey = '$' + namespace

const mixin = {
    async created () {
        if (!this.$options[namespace]) {
            return
        }
        const vmOptions = this.$options[namespace]
        const wait = []
        const validKeys = ['subscribe', 'register']
        for (const type of validKeys) {
            const t = vmOptions[type]
            for (const name in t) {
                const opts = t[name]
                let handler
                let defOpts = {
                    acknowledge: true
                }
                if (typeof opts === 'function') {
                    handler = opts
                } else {
                    handler = opts.handler
                    defOpts = Object.assign(defOpts, opts)
                    delete defOpts.handler
                }
                if (typeof handler !== 'function') {
                    throw new TypeError('handler must be callable')
                }
                wait.push(this[injectKey][type](name, handler.bind(this), defOpts))
            }
        }
        await Promise.all(wait)
    },
    async beforeDestroy () {
        if (this[namespace]) {
            await this[namespace].destroy()
        }
    }
}

export default function NuxtWampPlugin (context, inject) {
    if (!process.client) {
        options.max_retries = 0
        options.ssr = true
    }

    const conOptions = { ...options }
    if (options.challenger) {
        if (!(options.challenger instanceof Function)) {
            throw new TypeError('challenger option must be callable')
        }
        conOptions.onchallenge = options.challenger(context)
        if (!(conOptions.onchallenge instanceof Function)) {
            throw new TypeError('return value of challenger option must be callable')
        }
    }

    const connection = new Connection(conOptions)

    Vue.mixin(mixin)

    if (!Vue[injectKey]) {
        Vue[injectKey] = connection
    }

    if (!Vue.prototype[injectKey]) {
        Object.defineProperty(Vue.prototype, injectKey, {
            get () {
                if (!this[namespace]) {
                    this[namespace] = new Context(connection, this)
                }
                return this[namespace]
            }
        })
    }

    if (!context.app[injectKey]) {
        context.app[injectKey] = connection
    }

    if (context.store && !context.store[injectKey]) {
        context.store[injectKey] = connection
    }
}
