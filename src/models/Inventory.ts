import { InventoryResDto } from "../dto/InventoryResDto"

export const CATEGORY_ALL = 'all'
export enum Category {
    FOOD = 'food',
    COOKING_EQUIPMENT = 'cooking-equipment',
    BEVERAGES = 'beverages'
}

export type Inventory = {
    restaurantId: string
    inventoryId: string
    name: string
    currentStock: number
    price: string
    supplier: string
}

export type Supplier = {
    name: string
    description: string
}

export class InventoryModel {
    constructor(
        public restaurantId: string,
        public inventoryId: string,
        public name: string,
        public currentStock: number,
        public price: number,
        public supplier: Supplier,
        public discount?: number,
    ) {}

    toObject() : Inventory {
        return {
            restaurantId: this.restaurantId,
            inventoryId: this.inventoryId,
            name: this.name,
            currentStock: this.currentStock,
            price: this.price.toString(),
            supplier: JSON.stringify(this.supplier)
        }
    }

    getCategory(): string {
        const [category] = this.inventoryId.split('#')
        return category
    }

    static validateId(id: string): boolean {
        return id.split('#').length === 3
    }

    toResponse() : InventoryResDto {
        const [category] = this.inventoryId.split('#')
        const discount = this.discount ? (this.discount/100) : 0
        return {
            id: this.inventoryId,
            category,
            current_stock: this.currentStock,
            name: this.name,
            price: this.price - (discount * this.price),
            supplier: this.supplier
        }
    }
}