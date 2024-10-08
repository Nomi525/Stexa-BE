import ServicesProductList from '../../models/ServicesProductList.js'
import StatusCodes from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
import { handleErrorResponse } from '../../services/CommonService.js'

export const addEditServicesProductList = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            serviceId,
            superCategoryId,
            categoryId,
            subCategoryId,
            quantity,
            fabricServiceType,
            id,
        } = req.body
        let productData

        const existProduct = await ServicesProductList.findOne({ _id: id })
        const multipleFiles = req.files['productImage']
            ? req.files['productImage'].map((e) => ({ file: e.filename }))
            : []

        if (multipleFiles !== null && multipleFiles !== '') {
            multipleFiles
        }
        if (existProduct) {
            const productImage = req.body.productImage || []

            console.log(productImage, 'productImage')

            const updatedProductImages =
                existProduct.productImage.concat(multipleFiles)

            let images = removeMatchingElements(
                updatedProductImages,
                productImage
            )

            // eslint-disable-next-line no-inner-declarations
            function removeMatchingElements(arr1, arr2) {
                return arr1.filter((element) => {
                    if (typeof element === 'object' && element._id) {
                        return !arr2.includes(element._id.toString())
                    } else {
                        return !arr2.includes(element)
                    }
                })
            }

            productData = await ServicesProductList.findOneAndUpdate(
                { _id: existProduct._id },
                {
                    $set: {
                        name,
                        description,
                        price,
                        quantity,
                        fabricServiceType:
                            fabricServiceType && fabricServiceType.split(','),
                        productImage: images,
                    },
                    // $push: {
                    //     productImage:
                    //         multipleFiles !== null &&
                    //         multipleFiles !== '' &&
                    //         multipleFiles.length > 0
                    //             ? multipleFiles
                    //             : existProduct.designImage,
                    // },
                },
                { new: true }
            )
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.PRODUCT_UPDATED,
                data: productData,
            })
        } else {
            productData = await ServicesProductList.create({
                subCategoryId,
                serviceId,
                superCategoryId,
                categoryId,
                name,
                quantity,
                fabricServiceType:
                    fabricServiceType && fabricServiceType.split(','),
                description,
                price,
                productImage:
                    multipleFiles !== null &&
                    multipleFiles !== '' &&
                    multipleFiles.length > 0
                        ? multipleFiles
                        : existProduct.designImage,
            })

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.PRODUCT_ADDED,
                data: productData,
            })
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const customizeProduct = async (req, res) => {
    try {
        const { customizeSize, customizeColor, customizeAdditional } = req.body
        const multipleFiles = req.files['customize']
            ? req.files['customize'].map((e) => ({ file: e.filename }))
            : []
        // Properly construct the productData object
        const productData = {
            customizeSize: customizeSize,
            customizeColor: customizeColor,
            customizeAdditional: customizeAdditional,
            image: multipleFiles,
        }
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_UPDATED,
            data: productData,
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const getAllServiceProductList = async (req, res) => {
    try {
        const data = await ServicesProductList.find({
            isDeleted: false,
        })
            .populate(
                'serviceId superCategoryId categoryId subCategoryId',
                'name'
            )
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_LIST,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getSingleServiceProductList = async (req, res) => {
    try {
        const data = await ServicesProductList.findById({
            _id: req.query.id,
        }).populate(
            'serviceId superCategoryId categoryId subCategoryId',
            'name'
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_LIST,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const removeServiceProductList = async (req, res) => {
    try {
        let { id } = req.query
        const data = await ServicesProductList.findById({ _id: id })
        data.isDeleted = true
        await data.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_REMOVED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getAllServiceProductListBySubCategory = async (req, res) => {
    try {
        const { id } = req.query
        const data = await ServicesProductList.find({ subCategoryId: id })
            .populate({ path: 'serviceId', select: 'name' })
            .populate({ path: 'superCategoryId', select: 'name' })
            .populate({ path: 'categoryId', select: 'name' })
            .populate({ path: 'subCategoryId', select: 'name' })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_LIST,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
