import path from 'path'
import consola from 'consola'

import meta from '../package'

const logger = consola.withScope(meta.name)

function NuxtWampModule (moduleOptions) {
    const nuxtOptions = this.options.wamp
    const options = { namespace: meta.name, ...nuxtOptions, ...moduleOptions }
    const namespace = options.namespace

    for (const relPath of ['plugins/index.js']) {
        this.addPlugin({
            src: path.resolve(__dirname, relPath),
            fileName: path.join(namespace, relPath),
            options
        })
    }

    for (const relPath of ['middleware/index.js', 'utils/connection.js']) {
        this.addTemplate({
            src: path.resolve(__dirname, relPath),
            fileName: path.join(namespace, relPath),
            options
        })
    }

    this.options.router.middleware.push(namespace)

    if (options.url) {
        logger.debug(`url: ${options.url}`)
    }
    if (options.transports) {
        for (const tp of options.transports) {
            logger.debug(`transport: ${tp.url}`)
        }
    }
}

export default NuxtWampModule

export { meta }
