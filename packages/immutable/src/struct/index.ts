
export {
    Struct,
    StructConstructor,
    
    DataState,
    DataStruct,

    PublicState,
    PublicStruct,

    copyWithoutState,

} from './struct'

export {

    $$state,
    State as StructState,
    StateApply as StructStateApply,
    StateDeepApply as StructStatePathApply,
    StateDeepApply as StructStatePaths,

    getShallowState,
    getDeepState as getState,
    setState,
    applyState,

    showStateKeys,
    hideNonStateKeys,
    matchKeyVisibility,

} from './state'