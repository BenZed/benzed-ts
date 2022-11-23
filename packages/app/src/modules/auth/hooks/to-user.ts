
import { CommandHook, RuntimeCommand } from '../../../command'
import Auth from '../auth'

//// Types ////

//// Hook ////

const toUser = <I extends object, O extends { user: object }>(): CommandHook<I,O> => 
    function (this: RuntimeCommand<I>, input: I) {

        const auth = this.getModule(Auth, true, 'parents')

        throw new Error('Not yet implemented')

    }

//// Helpers ////

//// Exports ////

export default toUser

export {
    toUser
}