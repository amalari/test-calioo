import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ValidationError } from "yup";
import { httpStatusCodes } from "../commons/http";
import { InventoryDiscountReqDto } from "../dto/InventoryDiscountReqDto";
import { InventoryDiscountResDto } from "../dto/InventoryDiscountResDto";
import { InventoryDiscountModel } from "../models/InventoryDiscount";
import inventoryDiscountService, { IInventoryDiscountService } from "../services/InventoryDiscountService";
import { IValidator } from "../validators/BaseInputValidator";
import inventoryDiscountInputValidator from "../validators/InventoryDiscountInputValidator";
import { BaseHandlers } from "./BaseHandlers";

class InventoryDiscountHandlers extends BaseHandlers {
    constructor(
        private service: IInventoryDiscountService,
        private validator: IValidator<InventoryDiscountReqDto>
    ){
        super()
    }

    async putInventoryDiscount(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            if(!event.body) throw new ValidationError('input cannot be null or empty')

            const reqBody = JSON.parse(event.body as string);
            await this.validator.validate(reqBody)
            const inventoryDiscount : InventoryDiscountModel = await this.service.upsert(reqBody as InventoryDiscountReqDto);
            return this.handleSuccess<InventoryDiscountResDto>(httpStatusCodes.OK, inventoryDiscount)
        } catch (error) {
            return this.handleError(error)
        }
    }
}

const handlers = new InventoryDiscountHandlers(inventoryDiscountService, inventoryDiscountInputValidator)

export const putInventoryDiscount = handlers.putInventoryDiscount.bind(handlers)
