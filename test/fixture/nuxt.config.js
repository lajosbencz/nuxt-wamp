const { resolve } = require('path');

module.exports = {
    rootDir: resolve(__dirname, '../..'),
    buildDir: resolve(__dirname, '.nuxt'),
    srcDir: __dirname,
    render: {
        resourceHints: false
    },
    modules: [
        require('../..')
    ],
    serverMiddleware: [
    ],
    build: {
        terser: false
    },
    plugins: ['~/plugins/wamp']
};
