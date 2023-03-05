import Module from '../module'
import Validateable from '../traits/validateable'

//// Main ////

/**
 * If the App contains a WebSocket Module, Client and Server will use it
 * to enable realtime connections.
 */
class Websocket extends Module.add(Module, Validateable) {

    onValidate(): void {
        this._assertUnique()
        this._assertRootParent()
    }

}

//// Exports ////

export default Websocket

export {
    Websocket
}