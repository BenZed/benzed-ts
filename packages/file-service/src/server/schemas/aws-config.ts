import { $, Infer } from '@benzed/schema'

/*** Exports ***/

export interface AwsConfig extends Infer<typeof $awsConfig> {}
export const $awsConfig = $({

    bucket: $.string,
    accessKeyId: $.string,
    secretAccessKey: $.string

})