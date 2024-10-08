import { StatusCodes } from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
import Product from '../../models/Product.js'

import DiscountAndOffer from '../../models/DiscountAndOffer.js'
import { handleErrorResponse } from '../../services/CommonService.js'
import Service from '../../models/Service.js'
import { createOfferCsv } from '../../utils/CsvFile.js'
import moment from 'momnet'

export const addEditProduct = async (req, res) => {
    try {
        const { name, description, quantity, price, id } = req.body
        let productData

        // Check if the product already exists
        const existProduct = await Product.findOne({ _id: id })

        if (existProduct) {
            // If the product exists, update its details
            productData = await Product.findOneAndUpdate(
                { _id: existProduct._id },
                { $set: { description, quantity, price } },
                { new: true }
            )

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.PRODUCT_UPDATED,
                data: productData,
            })
        } else {
            // If the product doesn't exist, create a new one
            productData = await Product.create({
                name,
                description,
                quantity,
                price,
            })

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.PRODUCT_ADDED,
                data: productData,
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const getAllProduct = async (req, res) => {
    try {
        const data = await Product.find({ isDeleted: false })
            .select('name description quantity price  isActive')
            .sort({ createdAt: -1 })
        return res.status(200).json({
            message: ResponseMessage.PRODUCT_LIST,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.query
        const data = await Product.findById({ _id: id })
        return res.status(200).json({
            message: ResponseMessage.PRODUCT_DETAILS,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const removeProduct = async (req, res) => {
    try {
        const productId = req.query.id

        const findProduct = await Product.findById(productId)

        if (!findProduct) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.PRODUCT_NOT_FOUND,
            })
        }

        let removeProduct = await Product.findByIdAndUpdate(
            { _id: productId },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )

        return res.status(200).json({
            message: ResponseMessage.PRODUCT_DELETED,

            data: removeProduct,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

// Discount & Offer APIS
export const addEditDiscountAndOffer = async (req, res) => {
    try {
        const {
            id,
            couponCode,
            serviceId,
            productId,
            discountType,
            discountValue,
            maxUsageCount,
            startDate,
            endDate,
            status,
            serviceProductType,
        } = req.body

        let discountAndOffer
        let mycouponCode = await DiscountAndOffer.findOne({
            couponCode,
            _id: { $ne: id },
        })

        if (mycouponCode) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.COUPON_CODE_ALREADY,
            })
        }
        if (id) {
            discountAndOffer = await DiscountAndOffer.findById(id)

            if (!discountAndOffer) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.DISCOUNT_AND_OFFER_NOT_FOUND,
                    data: [],
                })
            }
            discountAndOffer.couponCode = couponCode
            discountAndOffer.productId = productId
            discountAndOffer.serviceId = serviceId
            discountAndOffer.discountType = discountType
            discountAndOffer.discountValue = discountValue
            discountAndOffer.maxUsageCount = maxUsageCount
            discountAndOffer.startDate = startDate
            discountAndOffer.endDate = endDate
            discountAndOffer.status = status
            discountAndOffer.serviceProductType = serviceProductType

            const updatedDiscountAndOffer = await discountAndOffer.save()

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.DISCOUNT_AND_OFFER_UPDATED,
                data: updatedDiscountAndOffer,
            })
        } else {
            discountAndOffer = new DiscountAndOffer({
                couponCode,
                serviceId,
                productId,
                discountType,
                discountValue,
                maxUsageCount,
                startDate,
                endDate,
                status,
                serviceProductType,
            })
            const savedDiscountAndOffer = await discountAndOffer.save()

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.DISCOUNT_AND_OFFER_ADDED,
                data: savedDiscountAndOffer,
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const getAllDiscountAndOffer = async (req, res) => {
    try {
        const data = await DiscountAndOffer.find({ isDeleted: false })
            .select(
                'couponCode productId serviceId  discountType discountValue serviceProductType maxUsageCount startDate endDate isActive status isDeleted'
            )
            .populate(
                'productId serviceId',

                'name'
            )
            .sort({ createdAt: -1 })
        return res.status(200).json({
            message: ResponseMessage.DISCOUNT_AND_OFFER_LIST,
            data,
        })
    } catch (err) {
        console.log(err)
        return handleErrorResponse(res, err)
    }
}

export const getSingleDiscountAndOffer = async (req, res) => {
    try {
        const { id } = req.query
        const data = await DiscountAndOffer.findById({ _id: id })
        return res.status(200).json({
            message: ResponseMessage.DISCOUNT_AND_OFFER_DETAILS,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const removeDiscountAndOffer = async (req, res) => {
    try {
        const discountAndOfferId = req.query.id

        const findDiscountAndOffer =
            await DiscountAndOffer.findById(discountAndOfferId)

        if (!findDiscountAndOffer) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.DISCOUNT_AND_OFFER_NOT_FOUND,
            })
        }

        let removeDiscountAndOffer = await DiscountAndOffer.findByIdAndUpdate(
            { _id: discountAndOfferId },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )

        return res.status(200).json({
            message: ResponseMessage.DISCOUNT_AND_OFFER_DELETED,

            data: removeDiscountAndOffer,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

// Service APIS
export const addEditService = async (req, res) => {
    try {
        const { name, id } = req.body
        const imageFilename = req.file ? req.file.filename : undefined

        let service
        if (id) {
            service = await Service.findById(id)

            if (!service) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.SERVICE_NOT_FOUND,
                    data: [],
                })
            }

            service.name = name ? name : service.name
            service.image = imageFilename
            const updatedService = await service.save()

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.SERVICE_UPDATED,
                data: updatedService,
            })
        } else {
            service = new Service({
                name,
                image: imageFilename,
            })
            const savedService = await service.save()

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.SERVICE_ADDED,
                data: savedService,
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const getAllService = async (req, res) => {
    try {
        const data = await Service.find({ isDeleted: false })
            .select('name image isDeleted')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: ResponseMessage.SERVICE_LIST,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const removeservices = async (req, res) => {
    try {
        const serviceId = req.query.id
        const service = await Service.findById(serviceId)
        if (!service) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.SERVICE_NOT_FOUND,
                data: [],
            })
        }
        service.isDeleted = true
        await service.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.SERVICE_DELETED,
            data: service,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
export const getSingleService = async (req, res) => {
    try {
        const data = await Service.findById({ _id: req.query.id })

        return res.status(200).json({
            message: ResponseMessage.SERVICE_LIST,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const offerListingsToCSVExport = async (req, res) => {
    try {
        const offerData = await DiscountAndOffer.find().sort({ createdAt: -1 })

        let offerresult = await createOfferCsv(offerData)
        console.log(offerresult)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${'product_listings.csv'}`
        )
        res.send(offerresult)
    } catch (error) {
        console.error('Error exporting product listings to CSV:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

// New Api's
export const getAllActiveDiscountAndOffer = async (req, res) => {
    try {
        let now = moment()
        const data = await DiscountAndOffer.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
            maxUsageCount: { $gt: 0 },
            isDeleted: false,
            isActive: true,
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            message: ResponseMessage.DISCOUNT_AND_OFFER_LIST,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
export const dicscountAndOfferActiveDeactiveStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        const mydata = await DiscountAndOffer.findOne({ _id: id })
        const newActiveStatus = !mydata.isActive

        const data = await DiscountAndOffer.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isActive: newActiveStatus,
                    status,
                },
            },
            { new: true }
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: !newActiveStatus
                ? ResponseMessage.OFFER_DEACTIVE
                : ResponseMessage.OFFER_ACTIVE,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const applyDicsountAndOffer = async (req, res) => {
    try {
        const { id } = req.query
        const data = await DiscountAndOffer.findById({ _id: id })
        return res.status(200).json({
            message: ResponseMessage.DISCOUNT_AND_OFFER_DETAILS,
            data,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
