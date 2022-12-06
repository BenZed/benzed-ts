
import { nil } from '@benzed/util'

import { GetModuleInput, GetModuleScope, Module } from '../../module'
import { provider, Provider } from './provider'

//// Main ////

const provideModule = <I extends object, M extends Module, R extends boolean>(
    type: GetModuleInput<M>, 
    required: R, 
    scope: GetModuleScope
): Provider<I, R extends true ? M : M | nil> =>
    provider(cmd => cmd.getModule(type, required, scope))

//// Exports ////

export default provideModule

export {
    provideModule
}