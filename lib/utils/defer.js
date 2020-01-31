
export default function Defer () {
    return (() => {
        let res = null
        let rej = null
        const promise = new Promise((resolve, reject) => {
            res = resolve
            rej = reject
        })
        return {
            promise,
            reject: rej,
            resolve: res
        }
    })()
}
