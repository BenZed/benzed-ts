import createValidator from './create-validator'

// POTENTIAL JSX ALT SYNTAX THAT'S MORE TYPESCRIPT FRIENDLY
// const $: any = {}

// const isCoord = $.object({
//     x: $.number.integer.required,
//     y: $.number.integer.required
// })

// const isMessages = $.array.length('>', 0).of(
//     $.object({
//         msg: $.string.length('>', 0).or.null.or.undefined.or.integer.range('>', 0),

//     })
// )

/*** Exports ***/

export default createValidator

export {
    createValidator
}