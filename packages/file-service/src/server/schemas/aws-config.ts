import { $, Infer } from '@benzed/schema'

/*** Exports ***/

export type AwsConfig = Infer<typeof $awsConfig>
export const $awsConfig = $({

    bucket: $.string,
    accessKeyId: $.string,
    secretAccessKey: $.string

})