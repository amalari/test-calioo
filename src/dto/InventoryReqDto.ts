export type InventoryReqDto = {
    restaurant_id: string
    name: string
    category: string
    current_stock: number
    price: number
    supplier: SupplierReqDto
}

export type SupplierReqDto = {
    name: string
    description: string
}