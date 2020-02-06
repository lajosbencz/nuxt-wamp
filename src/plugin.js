import Vue from 'vue'
import VueWamp from 'vue-wamp'
import defOptions from 'vue-wamp/src/Options'

const userOptions = JSON.parse('<%= JSON.stringify(options) %>')
const options = { ...defOptions, ...userOptions }
const { namespace } = options
const injectKey = '$' + namespace

export default function NuxtWampPlugin (context, inject) {
    if (!process.client) {
        options.max_retries = 1
        options.auto_reestablish = false
        options.auto_close_timeout = 200
    }

    if (options.challenger) {
        if (!(options.challenger instanceof Function)) {
            throw new TypeError('challenger option must be callable')
        }
        options.onchallenge = options.challenger(context)
        if (!(options.onchallenge instanceof Function)) {
            throw new TypeError('return value of challenger option must be callable')
        }
    }

    Vue.use(VueWamp, options)

    if (!context.app[injectKey]) {
        context.app[injectKey] = Vue[injectKey]
    }

    if (context.store && !context.store[injectKey]) {
        context.store[injectKey] = Vue[injectKey]
    }
}
