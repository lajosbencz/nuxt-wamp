
import consola from 'consola'

const options = JSON.parse('<%= JSON.stringify(options) %>')

const logger = consola.withScope(options.namespace)

export default logger
