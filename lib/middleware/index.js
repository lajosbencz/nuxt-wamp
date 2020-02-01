import logger from '../utils/logger'
import Middleware from '../../middleware'

const options = JSON.parse('<%= JSON.stringify(options) %>')
const { namespace } = options
Middleware[namespace] = ({ route }) => {
    // simply console logging here to demonstrate access to app context.
    logger.log('Counter middleware route', route.path)
    // console.log('Counter middleware store', store.state[namespace].count)
    // console.log('Counter middleware app', app[`$${namespace}`].value())
}
