
import { CommandHook, RuntimeCommand } from '../../../command'
import Auth from '../auth'

//// Types ////

//// Hook ////

const provideUser = <I extends object, U extends object>(): CommandHook<I, I & { user: U }> => 
    function (input: I) {

        const auth = this.getModule(Auth, true, 'parents')

        throw new Error('Not yet implemented')

    }

//// Helpers ////

//// Exports ////

export default provideUser

export {
    provideUser
}