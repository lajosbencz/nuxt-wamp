import path from 'path'

import meta from '../package'

function NuxtWampModule (moduleOptions) {
    const nuxtOptions = this.options.wamp
    const options = { namespace: 'wamp', ...nuxtOptions, ...moduleOptions }
    const namespace = options.namespace

    for (const relPath of ['plugins/index.js']) {
        this.addPlugin({
            src: path.resolve(__dirname, relPath),
            fileName: path.join(namespace, relPath),
            options
        })
    }

    for (const relPath of ['middleware/index.js', 'utils/connection.js', 'utils/logger.js', 'utils/context.js']) {
        this.addTemplate({
            src: path.resolve(__dirname, relPath),
            fileName: path.join(namespace, relPath),
            options
        })
    }

    this.options.router.middleware.push(namespace)
}

export default NuxtWampModule

export { meta }
