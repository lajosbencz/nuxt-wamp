import Vue from 'vue'
import autobahn from 'autobahn'
import Connection from '../utils/connection.js'

import '../middleware'

const options = JSON.parse('<%= JSON.stringify(options) %>')
const { namespace } = options

if (process.client) {
    Vue.mixin({
        async created () {
            this[namespace] = []
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
                    wait.push(this['$' + namespace][type](name, handler.bind(this), defOpts))
                }
            }
            this[namespace] = await Promise.all(wait)
        },
        async beforeDestroy () {
            const wait = []
            for (const topic of this[namespace]) {
                switch (true) {
                case topic instanceof autobahn.Registration:
                    wait.push(this['$' + namespace].unregister(topic))
                    break
                case topic instanceof autobahn.Subscription:
                    wait.push(this['$' + namespace].unsubscribe(topic))
                    break
                }
            }
            await Promise.all(wait)
            this[namespace] = []
        }
    })
}

export default function NuxtWampPlugin (context, inject) {
    if (process.server) {
        options.max_retries = 0
        options.ssr = true
    }

    const connection = new Connection(options)
    inject(namespace, connection)
}
