import Connection from '../utils/connection.js'

const options = JSON.parse('<%= JSON.stringify(options) %>')
const { namespace } = options

export default function NuxtWampPlugin (context, inject) {
    if (process.server) {
        options.max_retries = 0
        options.ssr = true
    }

    const connection = new Connection(options)
    inject(namespace ?? 'wamp', connection)
}
