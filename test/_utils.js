const defaultConfig = require('./fixture/nuxt.config')
const { Nuxt, Builder } = require('nuxt-edge')
const autobahn = require('autobahn')

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

function setupAutobahn (config) {
    return new Promise((resolve, reject) => {
        const connection = new autobahn.Connection({
            url: 'ws://localhost:4000/',
            realm: 'dev'
        })
        connection.onopen = function (session) {
            resolve({
                connection,
                session
            })
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
    setupAutobahn
}
