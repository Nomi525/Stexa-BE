import WishListProduct from '../../models/WishListProduct.js'
import StatusCodes from 'http-status-codes'

import { ResponseMessage } from '../../utils/ResponseMessage.js'
import { handleErrorResponse } from '../../services/CommonService.js'

//#region adding a product to the wishlist

export const addProductWishList = async (req, res) => {
    const userId = req.user
    const { productId, serviceProductId } = req.query

    if (!productId && !serviceProductId) {
        return res
            .status(400)
            .send('You must provide either a productId or a serviceProductId')
    }

    try {
        const queryConditions = [
            { userId, productId: productId || undefined, isDeleted: false },
            {
                userId,
                serviceProductId: serviceProductId || undefined,
                isDeleted: false,
            },
        ].filter(
            (condition) =>
                Object.values(condition).includes(undefined) === false
        )

        const existingWishListEntry = await WishListProduct.findOne({
            $or: queryConditions,
        })
        console.log(existingWishListEntry)
        if (existingWishListEntry) {
            return res.status(400).send({
                success: StatusCodes.BAD_REQUEST,
                message: 'This product or service is already in your wishlist',
            })
        }

        // Create a new wishlist entry
        const newWishListEntry = new WishListProduct({
            userId,
            productId: productId || null,
            serviceProductId: serviceProductId || null,
        })

        await newWishListEntry.save()
        return res.status(200).send({
            success: StatusCodes.OK,
            message: 'Product added to wishlist successfully',
            data: newWishListEntry,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

// #endregion

//#region listing wishlist products by user id
export const productListingByUserId = async (req, res) => {
    try {
        const userId = req.user

        const wishListProductsList = await WishListProduct.find({
            userId,
            isDeleted: false,
        })
            .populate({
                path: 'serviceProductId',
                populate: [
                    { path: 'serviceId', select: 'name' },
                    { path: 'superCategoryId', select: 'name' },
                    { path: 'categoryId', select: 'name' },
                    { path: 'subCategoryId', select: 'name' },
                ],
            })
            .populate('productId')
            .populate({ path: 'userId', select: 'name email phoneNumber' })
            .sort({ createdAt: -1 })

        return res.status(200).send({
            success: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_LISTING_BY_USER_ID,
            data: wishListProductsList,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const removeWishiListProduct = async (req, res) => {
    try {
        const userId = req.user
        const { id } = req.query

        const wishListProduct = await WishListProduct.findOneAndUpdate(
            { userId: userId, serviceProductId: id, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        )

        if (wishListProduct) {
            return res.status(200).send({
                success: StatusCodes.OK,
                message: ResponseMessage.REMOVE_WISHLIST_PRODUCT,
                data: wishListProduct,
            })
        } else {
            return res.status(404).send({
                success: false,
                message: 'Product not found in wishlist or already deleted',
            })
        }
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
