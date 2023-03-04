import Module from '../module'
import OnValidate from '../traits/on-validate'

//// Main ////

/**
 * If the App contains a WebSocket Module, Client and Server will use it
 * to enable realtime connections.
 */
class Websocket extends Module.add(Module, OnValidate) {

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