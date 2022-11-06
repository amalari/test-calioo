import * as yup from "yup";
import { InventoryReqDto } from "../dto/InventoryReqDt";
import { Category } from "../models/Inventory";
import { BaseInputValidator, IValidator } from "./BaseInputValidator";

class InventoryInputValidator extends BaseInputValidator<InventoryReqDto> implements IValidator<InventoryReqDto> {
    constructor(){
        const schema : yup.SchemaOf<InventoryReqDto> = yup.object().shape({
            category: yup.string().oneOf(Object.values(Category)).required(),
            currentStock: yup.number().required(),
            name: yup.string().required(),
            price: yup.number().required(),
            restaurantId: yup.string().required(),
            supplier: yup.object().shape({
                name: yup.string().required(),
                description: yup.string().required()
            })
        })
        super(schema)
    }
}

export default new InventoryInputValidator()