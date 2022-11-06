import { Supplier } from "../models/Inventory"

export type InventoryResDto = {
    id: string
    name: string
    category: string
    current_stock: number
    price: number
    supplier: Supplier
}