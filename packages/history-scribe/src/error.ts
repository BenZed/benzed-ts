
//// Main ////

class HistoryInvalidError extends Error {

    constructor (message: string) {
        super('History output invalid: ' + message)
        this.name = 'HistoryInvalidError'
    }

}

//// Exports ////

export default HistoryInvalidError

export {
    HistoryInvalidError
}