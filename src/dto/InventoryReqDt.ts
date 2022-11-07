import { Supplier } from "../models/Inventory"

export type InventoryReqDto = {
    restaurant_id: string
    name: string
    category: string
    current_stock: number
    price: number
    supplier: Supplier
}