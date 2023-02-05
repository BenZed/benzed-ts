export {
    Struct,
    StructConstructor,
    
    DataState,
    DataStruct,

    PublicState,
    PublicStruct,

    copy,
    copyWithoutState,

    equals

} from './struct'

export {

    $$state,
    State as StructState,
    StateApply as StructStateApply,
    StatePathApply as StructStatePathApply,
    StatePathApply as StructStatePaths,

    getShallowState,
    getDeepState as getState,
    setState,
    applyState,

    showStateKeys,
    hideNonStateKeys,
    matchKeyVisibility,

} from './state'