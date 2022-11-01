import $, { Infer } from "@benzed/schema"
import { ModuleWithSettings } from "../../module"

//// Types ////

interface GetRecordSettings extends Infer<typeof $getSetting> {}
const $getSetting = $({
    collection: $.string.asserts(name => name.startsWith(`get-`), `must start with "get-"`)
})

//// GetRecord ////

class GetRecord extends ModuleWithSettings<GetRecordSettings> {

    //// Sealed ////
    
    static create (settings: GetRecordSettings): GetRecord {
        return new GetRecord($getSetting.validate(settings))
    }

    private constructor(
        settings: GetRecordSettings
    ) {
        super(settings)
    }

}

//// Exports ////

export default GetRecord 

export {
    GetRecord
}