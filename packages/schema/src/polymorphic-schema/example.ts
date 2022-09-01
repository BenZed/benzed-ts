import { $, Infer } from './index'

const AddressSchema = $({
    street: $.string(),
    apartment: $.string().optional(),
    country: $.string(),
    code: $({
        prefix: $.number(),
        postfix: $.number(),
        payload: $.string().optional()
    }).readonly().optional(),
    switch: $.boolean()
})

const VectorSchema = $({
    x: $.number(),
    y: $.number(),
    z: $.number().optional()
})

const EdgeSchema = $(VectorSchema, VectorSchema)

const RangeSchema = $.tuple($.number(), $.number())

const TeamSchema = $({
    status: $($.boolean(), $.string()),
    traffic: $($.boolean(), 'red', 'green'),
    keys: $.record($.string())
})

const VectorTeamSchema = $.and(
    VectorSchema,
    TeamSchema
)

const CompositeSchema = $({
    vt: VectorTeamSchema.optional(),
    range: RangeSchema.readonly(),
    edge: EdgeSchema,
    address: AddressSchema.optional()
})

type Composite = Infer<typeof CompositeSchema>