import $, { Infer } from '@benzed/schema'
import { omit } from '@benzed/util/lib'

import jwt, { JwtPayload } from 'jsonwebtoken'

import { SettingsModule } from '../../module'

//// Helper ////

// Generates a new secret every day.
const randomSecret = (() => {

    const random = Math.random() * 10000000

    return () => {
        const date = new Date()
        date.setMilliseconds(0)
        date.setSeconds(0)
        date.setMinutes(0)
        date.setHours(0)
        return (date.getTime() + random).toString().replace('.', '')
    }

})()

//// Settings ////

interface AuthSettings extends Infer<typeof $authSettings> {}
const $authSettings = $({
    secret: $.string.optional.default(randomSecret)
})

type AssertPayload<T extends object> = 
    | ((input: object) => asserts input is T)
    | { assert: (input: object) => asserts input is T }

//// Module ////

class Auth extends SettingsModule<Required<AuthSettings>> {

    static create(settings: AuthSettings): Auth {
        return new Auth(
            $authSettings.validate(settings) as Required<AuthSettings>
        )
    }

    private constructor(
        settings: Required<AuthSettings>
    ) {
        super(settings)
    }

    //// Token Interface ////

    async createAccessToken(payload: object): Promise<string> {

        const { secret } = this.settings

        const token = await new Promise<string>((resolve, reject) => {
            jwt.sign(
                payload, 
                secret, 
                (error, token) => error 
                    ? reject(error) 
                    : resolve(token as string))
        })

        return token
    }

    async verifyAccessToken<T extends object>(
        token: string, 
        validatePayload?: AssertPayload<T>
    ): Promise<T> {

        const { secret } = this.settings
        
        // Verify
        const payload = await new Promise<JwtPayload>((resolve, reject) => 
            jwt.verify(
                token, 
                secret, 
                (error, payload) => error 
                    ? reject(error) 
                    : resolve(payload as JwtPayload)
            )
        )

        // Validate
        if (validatePayload) {
            void (typeof validatePayload === 'function' 
                ? validatePayload(payload) 
                : validatePayload.assert(payload))
        }

        return omit(
            payload, 
            'iat' // remove jwt fields added to the payload
        ) as T
    }

}

//// Exports ////

export default Auth

export {
    Auth
}