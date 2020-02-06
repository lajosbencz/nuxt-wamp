export default function ({ app: { $wamp }, redirect }) {
    // eslint-disable-next-line no-console
    console.log($wamp.constructor.name)
}
