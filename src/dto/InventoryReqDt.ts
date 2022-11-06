import { Supplier } from "../models/Inventory"

export type InventoryReqDto = {
    restaurantId: string
    name: string
    category: string
    currentStock: number
    price: number
    supplier: Supplier
}