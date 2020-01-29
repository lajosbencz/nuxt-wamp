
const { setupNuxt, setupNightlife, setupAutobahn } = require('./_utils')

describe('module', () => {
    let nuxt, nightlife, connection, session

    beforeAll(async () => {
        try {
            nightlife = setupNightlife()
            nuxt = await setupNuxt()
            await nuxt.builder.build()
            await nuxt.listen(3000)
        } catch (e) {
            console.error(e)
        }
    }, 60000)

    afterAll(async () => {
        connection.close()
        await nightlife.close()
        await nuxt.close()
    })

    test('asyncData', async () => {
        const ab = await setupAutobahn()
        session = ab.session
        connection = ab.connection

        await session.register('time', () => new Date().getTime())
        const res = await session.call('time')
        expect(res).not.toBeFalsy()
        expect(res).toBeGreaterThan(0)
    })
})
