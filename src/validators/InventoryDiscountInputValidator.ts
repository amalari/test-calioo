import * as yup from "yup";
import { InventoryDiscountReqDto } from "../dto/InventoryDiscountReqDto";
import { Category } from "../models/Inventory";
import { BaseInputValidator, IValidator } from "./BaseInputValidator";

class InventoryDiscountInputValidator extends BaseInputValidator<InventoryDiscountReqDto> implements IValidator<InventoryDiscountReqDto> {
    constructor(){
        const categories = Object.values(Category)
        const schema : yup.SchemaOf<InventoryDiscountReqDto> = yup.object().shape({
            category: yup.string().oneOf(categories),
            discount: yup.number().max(100).min(1).required()
        })
        super(schema)
    }
}

export default new InventoryDiscountInputValidator()