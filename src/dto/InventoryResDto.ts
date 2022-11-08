export type InventoryResDto = {
    id: string
    name: string
    category: string
    current_stock: number
    price: number
    supplier: SupplierResDto
}

export type SupplierResDto = {
    name: string
    description: string
}