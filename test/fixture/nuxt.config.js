const { resolve } = require('path')

module.exports = {
    rootDir: resolve(__dirname, '../..'),
    buildDir: resolve(__dirname, '.nuxt'),
    srcDir: __dirname,
    render: {
        resourceHints: false
    },
    modules: [
        ['../../src/index.js', {
            url: 'ws://localhost:4334',
            realm: 'realm1'
        }]
    ],
    serverMiddleware: [],
    build: {
        terser: false
    },
    plugins: ['~/plugins/wamp']
}
