import path from 'path'
import consola from 'consola'
import semver from 'semver'

import meta from '../package'

const logger = consola.withScope(meta.name)

function NuxtWampModule (_moduleOptions) {
    const _userOptions = this.options.wamp
    const options = { namespace: meta.name, ..._userOptions, ..._moduleOptions }
    const namespace = options.namespace

    for (const relPath of ['plugins/index.js']) {
        this.addPlugin({
            src: path.resolve(__dirname, relPath),
            fileName: path.join(namespace, relPath),
            options
        })
    }

    for (const relPath of ['middleware/index.js', 'utils/connection.js', 'utils/defer.js']) {
        this.addTemplate({
            src: path.resolve(__dirname, relPath),
            fileName: path.join(namespace, relPath),
            options
        })
    }

    this.options.build = this.options.build || {}
    this.options.build.transpile = this.options.build.transpile || {}
    // transpile only for non-modern build
    // istanbul ignore if
    // if (semver.gte(semver.coerce(this.nuxt.constructor.version), '2.9.0')) {
    //     this.options.build.transpile.push(({ isLegacy }) => isLegacy && 'ws')
    //     this.options.build.transpile.push(({ isLegacy }) => isLegacy && 'autobahn')
    // } else {
    //     this.options.build.transpile.push('ws')
    //     this.options.build.transpile.push('autobahn')
    // }

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
