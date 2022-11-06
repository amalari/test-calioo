export type InventoryDiscount = {
    category: string
    discount: number
}

export class InventoryDiscountModel {
    constructor(
        public category: string,
        public discount: number,
    ) {}
}