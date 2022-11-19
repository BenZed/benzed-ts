import $, { Infer, Schema, Flags } from '@benzed/schema'
import { Compile } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent,
    @typescript-eslint/explicit-function-return-type
*/

//// Query Syntax ////

type Queryable = Schema<any, any, any>

type QueryInput ={
    [key: string]: Queryable
}

type QuerySortOutput<I extends QueryInput> = {
    [K in keyof I]?: 1 | -1
}

type QuerySelectOutput<I extends QueryInput> = readonly (keyof I)[]

type QueryPropertyOutput<I extends Queryable> = 
    Infer<I> | 
   {
        $gt?: Infer<I>
        $gte?: Infer<I>
        $lt?: Infer<I>
        $lte?: Infer<I>
        $ne?: Infer<I>
        $in?: Infer<I>[]
        $nin?: Infer<I>[]
    }

type QueryPropertiesOutput<I extends QueryInput> = {
    [K in keyof I]?: QueryPropertyOutput<I[K]>
}

type QuerySyntaxOutput<I extends QueryInput> = Compile<{

    $skip?: number
    $sort?: QuerySortOutput<I> 
    $limit?: number
    $select?: QuerySelectOutput<I>

} & QueryPropertiesOutput<I>>

//// Main ////

const $querySort = <I extends QueryInput>(
    input: I
): Schema<I, QuerySortOutput<I>, [Flags.Optional]> => {

    const sortShape = {} as any
    for (const key in input)
        sortShape[key] = $(1, -1)

    return $.shape(sortShape).optional as any
}

const $querySelect = <I extends QueryInput>(
    input: I
): Schema<I, QuerySelectOutput<I>, [Flags.Optional]> => 
    $.array(
        $.enum(
            ...Object.keys(input)
        )
    ).optional as any

const $queryProperty = <I extends Queryable>(input: I): 
    Schema<
        I, 
        QueryPropertyOutput<I>, 
        [Flags.Optional]
    > => {

        const inputOptional = input.isOptional 
            ? input 
            : (input as any).optional
                
        return $.or(
            input,
            $.shape({
                $gt: inputOptional,
                $gte: inputOptional,
                $lt: inputOptional,
                $lte: inputOptional,
                $ne: inputOptional,
                $in: $.array(input).optional,
                $nin: $.array(input).optional
            })
        ).optional as any
    }

const $queryProperties = <I extends QueryInput>(
    input: I
): Schema<I, QueryPropertiesOutput<I>, [Flags.Optional]> => {

    const queryPropsShape = {} as any
    for (const key in input)
        queryPropsShape[key] = $queryProperty(input[key])

    return $.shape(queryPropsShape) as any
}

//// Main ////

const $querySyntax = <I extends QueryInput>(
        input: I
    ): Schema<I, QuerySyntaxOutput<I>, []> =>
    
    $.shape({
        $limit: $.number.range('>=', 0).optional,
        $skip: $.number.range('>=', 0).optional,
        $sort: $querySort(input),
        $select: $querySelect(input),
        ...($queryProperties(input) as any).properties
    }) as any

//// Exports ////

export default $querySyntax

export { $querySyntax }
