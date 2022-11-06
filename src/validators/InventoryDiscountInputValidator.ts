import * as yup from "yup";
import { InventoryDiscountReqDto } from "../dto/InventoryDiscountReqDto";
import { Category } from "../models/Inventory";
import { BaseInputValidator, IValidator } from "./BaseInputValidator";

class InventoryDiscountInputValidator extends BaseInputValidator<InventoryDiscountReqDto> implements IValidator<InventoryDiscountReqDto> {
    constructor(){
        const categories = Object.values(Category)
        const schema : yup.SchemaOf<InventoryDiscountReqDto> = yup.object().shape({
            category: yup.string().oneOf([...categories, null]),
            discount: yup.number().required()
        })
        super(schema)
    }
}

export default new InventoryDiscountInputValidator()