
const http = require('http')
const autobahn = require('autobahn')
const nightlife = require('nightlife-rabbit')
const CLogger = require('node-clogger')
const { Nuxt, Builder } = require('nuxt-edge')

const defaultConfig = require('./fixture/nuxt.config')

jest.setTimeout(60000)

async function setupMockNuxt (config) {
    const nuxt = new Nuxt({
        ...defaultConfig,
        ...config,
        _ready: false
    })

    nuxt.moduleContainer.addTemplate = jest.fn(nuxt.moduleContainer.addTemplate)

    await nuxt.ready()

    const builder = new Builder(nuxt)

    await builder.validatePages()
    await builder.generateRoutesAndFiles()
    nuxt.builder = builder

    return nuxt
}

async function setupNuxt (config) {
    const nuxt = new Nuxt({
        ...defaultConfig,
        ...config,
        _ready: false
    })

    jest.spyOn(nuxt.moduleContainer, 'addTemplate')

    await nuxt.ready()

    const builder = new Builder(nuxt)
    nuxt.builder = builder

    return nuxt
}

function setupNightlife (config) {
    const logger = new CLogger({ name: '' })
    logger.log = function (level, message) { }
    const router = nightlife.createRouter({
        httpServer: http.createServer(),
        port: 4000,
        path: '/',
        autoCreateRealms: false,
        logger,
        ...config
    })
    router.createRealm('dev')
    return router
}

function setupAutobahn (config) {
    return new Promise((resolve, reject) => {
        const connection = new autobahn.Connection({
            url: 'ws://localhost:4000/',
            realm: 'dev'
        })
        connection.onopen = function (session) {
            resolve({ connection, session })
        }
        connection.onclose = function (reason) {
            const e = new Error(reason)
            e.connection = connection
            reject(e)
        }
        connection.open()
    })
}

module.exports = {
    setupMockNuxt,
    setupNuxt,
    setupNightlife,
    setupAutobahn
}
