import Vue from 'vue'
import Connection from '../utils/connection.js'
import logger from '../utils/logger'

import '../middleware'

const options = JSON.parse('<%= JSON.stringify(options) %>')
const { namespace } = options

if (process.client) {
    Vue.mixin({
        created () {
            this[namespace] = {}

            if (!this.$options.wamp) {
                return
            }

            const vmOptions = this.$options.wamp

            // exposing only these two makes any sense
            const validKeys = ['subscribe', 'register']

            // loop topics/procedures
            for (const type of validKeys) {
                this[namespace][type] = {}
                const t = vmOptions[type]

                // loop topic/procedure names
                for (const name in t) {
                    const o = t[name]
                    let handler
                    let options = {
                        acknowledge: true
                    }
                    if (typeof o === 'function') {
                        // no options
                        handler = o
                    } else {
                        // user options
                        handler = o.handler
                        options = Object.assign(options, o)
                        delete options.handler
                    }
                    if (typeof handler !== 'function') {
                        throw new TypeError('handler must be callable')
                    }
                    // do it!
                    this.$wamp[type](name, handler.bind(this), options)
                        .then((r) => {
                            this[namespace][type][name] = r
                            logger.log('auto ' + type + ': ' + name)
                        })
                        .catch(logger.error)
                }
            }
        },
        async beforeDestroy () {
            const wait = []
            for (const type in this[namespace]) {
                if (!(type in this[namespace])) {
                    continue
                }
                const untype = 'un' + type
                for (const name in this[namespace][type]) {
                    if (!(name in this[namespace][type])) {
                        continue
                    }
                    wait.push(this.$wamp[untype](this[namespace][type][name]))
                    logger.log('auto ' + untype + ': ' + name)
                }
            }
            await Promise.all(wait)
            this[namespace] = {}
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
