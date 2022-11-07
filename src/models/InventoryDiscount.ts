import { InventoryDiscountResDto } from "../dto/InventoryDiscountResDto"

export type InventoryDiscount = {
    category: string
    discount: number
}

export class InventoryDiscountModel {
    constructor(
        public category: string,
        public discount: number,
    ) {}

    toResponse() : InventoryDiscountResDto {
        return {
            category: this.category,
            discount: this.discount
        }
    }
}