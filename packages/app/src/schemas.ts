import $ from '@benzed/schema'

export const $port = $.integer.range({ 
    min: 1025, 
    comparator: `...`, 
    max: 65536
})

export const $logIcon = $.string.optional.default(`ℹ️`)