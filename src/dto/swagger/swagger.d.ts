import { TMeta } from "../../types/response";
import { InventoryDiscountResDto } from "../InventoryDiscountResDto";
import { InventoryResDto } from "../InventoryResDto";

export type InventoriesResponse = {
    data: InventoryResDto[],
    meta: TMeta
}

export type InventoryResponse = {
    data: InventoryResDto
}

export type InventoryDiscountResponse = {
    data: InventoryDiscountResDto
}