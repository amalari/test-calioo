import * as yup from "yup";
import { AssertsShape, ObjectShape } from "yup/lib/object";

export interface IValidator<T> {
    validate : (input: T) => Promise<AssertsShape<ObjectShape>>
}

export class BaseInputValidator<T> implements IValidator<T> {
    constructor(
        protected schema: yup.ObjectSchema<ObjectShape>
    ){}

    async validate(input: T): Promise<AssertsShape<ObjectShape>>{
        return this.schema.validate(input, { abortEarly: false })
    }
}