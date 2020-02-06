import path from 'path'
import meta from '../package.json'

function NuxtWampModule (moduleOptions) {
    let { namespace } = moduleOptions
    if (!namespace) {
        namespace = 'wamp'
    }
    const nuxtOptions = this.options[namespace]
    const options = { ...nuxtOptions, ...moduleOptions }

    const pluginFile = 'plugin.js'

    this.addPlugin({
        src: path.resolve(__dirname, pluginFile),
        fileName: path.join(namespace, pluginFile),
        options
    })

    this.options.build = this.options.build || {}
    this.options.build.transpile = this.options.build.transpile || {}
    this.options.build.transpile.push('vue-wamp')
}

export default NuxtWampModule

export { meta }
