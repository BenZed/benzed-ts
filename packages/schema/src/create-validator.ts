import { Validator, ValidatorProps } from './validators/type'

/*** Data ***/

/*** Helper ***/

function resolveValidatorFactory(
    type: keyof DefaultValidators
): (props: ValidatorProps) => Validator<any> {

}

/*** Main ***/

function createValidator<T>(
    type: keyof DefaultValidators,
    props?: DefaultValidators[typeof type],
    children?: (typeof props)['children']
): Validator<T> {

    const validatorFactory = resolveValidatorFactory(type)

    return validatorFactory({ ...props, children })
}

export default createValidator