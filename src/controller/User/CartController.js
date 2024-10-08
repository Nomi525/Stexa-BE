import Cart from '../../models/Cart.js'
import Product from '../../models/Product.js'
import User from '../../models/User.js'
import Order from '../../models/PlaceOrder.js'
import StatusCodes from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
import mongoose from 'mongoose'
import {
    generateBookingId,
    generateOrderId,
    generateRefundId,
    handleErrorResponse,
} from '../../services/CommonService.js'
import DiscountAndOffer from '../../models/DiscountAndOffer.js'
import ServicesProductList from '../../models/ServicesProductList.js'
import moment from 'momnet'
import Booking from '../../models/Booking.js'
import Transaction from '../../models/Transaction.js'
import Quotation from '../../models/Quotation.js'
import expert from '../../models/Expert.js'
import admin from '../../models/Admin.js'
import Refund from '../../models/Refund.js'
import {
    orderCancelEmail,
    orderRefundEmail,
} from '../../services/EmailServices.js'
import CouponUsage from '../../models/CouponUsages.js'

// import PDFDocument from 'pdfkit'

export const addUpdateProductToCart = async (req, res) => {
    try {
        const userId = req.user
        const productId = req.body.productId
        const ServicesProductId = req.body.ServicesProductId
        const quantity = req.body.quantity
        const customizeSize = req.body.customizeSize
        const customizeColor = req.body.customizeColor
        const customizeAdditional = req.body.customizeAdditional
        const fabricServiceType = req.body.fabricServiceType
        const image = req.body.image

        // Initialize product and serviceProduct variables
        let product = null
        let serviceProduct = null

        // Fetch the product or service product based on the provided ID
        if (productId) {
            product = await Product.findById(productId)
            if (!product) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.PRODUCT_NOT_FOUND,
                })
            }
            if (product.quantity < quantity) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.OUT_OF_STOCK,
                })
            }
        } else if (ServicesProductId) {
            serviceProduct =
                await ServicesProductList.findById(ServicesProductId)
            if (!serviceProduct) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.SERVICE_PRODUCT_NOT_FOUND,
                })
            }
            if (serviceProduct.quantity < quantity) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.OUT_OF_STOCK,
                })
            }
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.INVALID_REQUEST,
            })
        }

        const cartList = await Cart.findOne({ userId })

        if (cartList) {
            let existingProductIndex = -1
            let existingServiceProductIndex = -1

            if (productId) {
                existingProductIndex = cartList.products.findIndex(
                    (p) => p.productId == productId
                )
            } else if (ServicesProductId) {
                existingServiceProductIndex =
                    cartList.ServicesAndProducts.findIndex(
                        (sp) => sp.ServicesProductId == ServicesProductId
                    )
            }

            if (existingProductIndex > -1) {
                cartList.products[existingProductIndex].quantity += quantity
                cartList.products[existingProductIndex].subTotal +=
                    product.price * quantity
            } else if (existingServiceProductIndex > -1) {
                cartList.ServicesAndProducts[
                    existingServiceProductIndex
                ].quantity += quantity
                cartList.ServicesAndProducts[
                    existingServiceProductIndex
                ].subTotal += serviceProduct.price * quantity
            } else {
                if (productId) {
                    cartList.products.push({
                        productId,
                        quantity,
                        price: product.price,
                        subTotal: product.price * quantity,
                    })
                } else if (ServicesProductId) {
                    cartList.ServicesAndProducts.push({
                        ServicesProductId,
                        quantity,
                        price: serviceProduct.price,
                        subTotal: serviceProduct.price * quantity,
                        serviceId: serviceProduct.serviceId,
                        superCategoryId: serviceProduct.superCategoryId,
                        categoryId: serviceProduct.categoryId,
                        subCategoryId: serviceProduct.subCategoryId,
                        customize: {
                            customizeSize,
                            customizeColor,
                            customizeAdditional,
                            image,
                        },
                        fabricServiceType,
                    })
                }
            }

            cartList.totalamount =
                cartList.products.reduce(
                    (total, product) => total + (product.subTotal || 0),
                    0
                ) +
                cartList.ServicesAndProducts.reduce(
                    (total, serviceProduct) =>
                        total + (serviceProduct.subTotal || 0),
                    0
                )

            cartList.totalQuantity =
                cartList.products.reduce(
                    (total, product) => total + (product.quantity || 0),
                    0
                ) +
                cartList.ServicesAndProducts.reduce(
                    (total, serviceProduct) =>
                        total + (serviceProduct.quantity || 0),
                    0
                )

            await cartList.save()
            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.PRODUCTADDCART,
                data: cartList,
            })
        } else {
            const newCartList = await Cart.create({
                userId,
                products: productId
                    ? [
                          {
                              productId,
                              quantity,
                              price: product.price,
                              subTotal: product.price * quantity,
                          },
                      ]
                    : [],
                ServicesAndProducts: ServicesProductId
                    ? [
                          {
                              ServicesProductId,
                              quantity,
                              price: serviceProduct.price,
                              subTotal: serviceProduct.price * quantity,
                              serviceId: serviceProduct.serviceId,
                              superCategoryId: serviceProduct.superCategoryId,
                              categoryId: serviceProduct.categoryId,
                              subCategoryId: serviceProduct.subCategoryId,
                              customize: {
                                  customizeSize,
                                  customizeColor,
                                  customizeAdditional,
                                  image,
                              },
                              fabricServiceType,
                          },
                      ]
                    : [],
                totalamount:
                    (product ? product.price * quantity : 0) +
                    (serviceProduct ? serviceProduct.price * quantity : 0),
                totalQuantity: quantity,
            })

            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.PRODUCTADDCART,
                data: newCartList,
            })
        }
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const removeProductFromCart = async (req, res) => {
    const userId = req.user
    const { productId, ServicesProductId } = req.body

    try {
        const cartList = await Cart.findOne({ userId })
        if (!cartList) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_NOT_FOUND,
            })
        }

        let productIndex = -1
        let serviceProductIndex = -1
        let productInCart
        let serviceProductInCart

        if (productId) {
            const productObjectId = new mongoose.Types.ObjectId(productId)
            productIndex = cartList.products.findIndex((p) =>
                p.productId.equals(productObjectId)
            )
            if (productIndex === -1) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.PRODUCT_NOT_FOUND_IN_CART,
                })
            }
            productInCart = cartList.products[productIndex]
            const product = await Product.findById(productObjectId)
            if (!product) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.PRODUCT_NOT_FOUND,
                })
            }
            product.quantity += productInCart.quantity
            // await product.save()
            cartList.products.splice(productIndex, 1)
        } else if (ServicesProductId) {
            const serviceProductObjectId = new mongoose.Types.ObjectId(
                ServicesProductId
            )
            serviceProductIndex = cartList.ServicesAndProducts.findIndex((sp) =>
                sp.ServicesProductId.equals(serviceProductObjectId)
            )
            if (serviceProductIndex === -1) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.SERVICE_PRODUCT_NOT_FOUND_IN_CART,
                })
            }
            serviceProductInCart =
                cartList.ServicesAndProducts[serviceProductIndex]
            const serviceProduct = await ServicesProductList.findById(
                serviceProductObjectId
            )
            if (!serviceProduct) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.SERVICE_PRODUCT_NOT_FOUND,
                })
            }
            serviceProduct.quantity += serviceProductInCart.quantity
            // await serviceProduct.save()
            cartList.ServicesAndProducts.splice(serviceProductIndex, 1)
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.INVALID_REQUEST,
            })
        }

        cartList.totalamount =
            cartList.products.reduce(
                (total, product) => total + product.subTotal,
                0
            ) +
            cartList.ServicesAndProducts.reduce(
                (total, serviceProduct) => total + serviceProduct.subTotal,
                0
            )

        cartList.totalQuantity =
            cartList.products.reduce(
                (total, product) => total + product.quantity,
                0
            ) +
            cartList.ServicesAndProducts.reduce(
                (total, serviceProduct) => total + serviceProduct.quantity,
                0
            )

        if (
            cartList.products.length === 0 &&
            cartList.ServicesAndProducts.length === 0
        ) {
            await Cart.deleteOne({ userId })
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_EMPTY,
            })
        }

        await cartList.save()

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCT_REMOVED_FROM_CART,
            data: cartList,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

//# simple get cart

export const getCart = async (req, res) => {
    const userId = req.user
    try {
        // Fetch the cart
        const cart = await Cart.findOne({ userId })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts.ServicesProductId',
                model: 'ServicesProductList',
            })

        if (!cart) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_EMPTY,
            })
        }

        let totalQuantity = 0
        let totalAmount = 0
        // let unavailableProducts = [];
        // let unavailableServices = [];

        // Update latest prices for products
        for (let cartProduct of cart.products) {
            const latestProduct = await Product.findById(
                cartProduct.productId._id
            )
            if (latestProduct) {
                cartProduct.price = latestProduct.price
                cartProduct.subTotal =
                    latestProduct.price * cartProduct.quantity
                totalQuantity += cartProduct.quantity
                totalAmount += cartProduct.subTotal
            }
            // else {
            //     // Handle the case where the product is no longer available
            //     cartProduct.price = 0;
            //     cartProduct.subTotal = 0;
            //     unavailableProducts.push(cartProduct.productId);
            // }
        }

        // Update latest prices for service products
        for (let cartServiceProduct of cart.ServicesAndProducts) {
            const latestServiceProduct = await ServicesProductList.findById(
                cartServiceProduct.ServicesProductId._id
            )

            if (latestServiceProduct) {
                cartServiceProduct.price = latestServiceProduct.price
                cartServiceProduct.subTotal =
                    latestServiceProduct.price * cartServiceProduct.quantity
                totalQuantity += cartServiceProduct.quantity
                totalAmount += cartServiceProduct.subTotal
            }
            // else {
            //     // Handle the case where the service product is no longer available
            //     cartServiceProduct.price = 0;
            //     cartServiceProduct.subTotal = 0;
            //     unavailableServices.push(cartServiceProduct.ServicesProductId);
            // }
        }

        // Update total quantity and total amount
        cart.totalQuantity = totalQuantity
        cart.totalamount = totalAmount

        // Save the updated cart
        await cart.save()

        // Fetch the updated cart with populated references again to ensure consistent response
        const updatedCart = await Cart.findOne({ userId })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts.ServicesProductId',
                model: 'ServicesProductList',
            })

        //     let responseMessage = ResponseMessage.CART_LIST;
        // if (unavailableProducts.length > 0 || unavailableServices.length > 0) {
        //     responseMessage += ' Note: Some items are no longer available.';
        //     if (unavailableProducts.length > 0) {
        //         responseMessage += ` Unavailable products: ${unavailableProducts.join(', ')}.`;
        //     }
        //     if (unavailableServices.length > 0) {
        //         responseMessage += ` Unavailable service products: ${unavailableServices.join(', ')}.`;
        //     }
        // }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CART_LIST,
            data: updatedCart,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const productQuantityUpdate = async (req, res) => {
    try {
        const userId = req.user
        const { productId, ServicesProductId, action } = req.body

        const cartList = await Cart.findOne({ userId })

        if (!cartList) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_NOT_FOUND,
            })
        }

        let product
        let serviceProduct
        let existingProductIndex = -1
        let existingServiceProductIndex = -1

        if (productId) {
            product = await Product.findById(
                new mongoose.Types.ObjectId(productId)
            )
            if (!product) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.PRODUCT_NOT_FOUND,
                })
            }
            existingProductIndex = cartList.products.findIndex((p) =>
                p.productId.equals(product._id)
            )
        } else if (ServicesProductId) {
            serviceProduct = await ServicesProductList.findById(
                new mongoose.Types.ObjectId(ServicesProductId)
            )
            if (!serviceProduct) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.SERVICE_PRODUCT_NOT_FOUND,
                })
            }
            existingServiceProductIndex =
                cartList.ServicesAndProducts.findIndex((sp) =>
                    sp.ServicesProductId.equals(serviceProduct._id)
                )
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.INVALID_REQUEST,
            })
        }

        if (existingProductIndex !== -1) {
            const existingProduct = cartList.products[existingProductIndex]

            if (action === 'increment') {
                existingProduct.quantity += 1
                product.quantity -= 1
            } else if (action === 'decrement') {
                if (existingProduct.quantity > 1) {
                    existingProduct.quantity -= 1
                    product.quantity += 1
                } else {
                    cartList.products.splice(existingProductIndex, 1)
                    product.quantity += existingProduct.quantity
                }
            }

            existingProduct.subTotal = existingProduct.quantity * product.price
        } else if (existingServiceProductIndex !== -1) {
            const existingServiceProduct =
                cartList.ServicesAndProducts[existingServiceProductIndex]

            if (action === 'increment') {
                existingServiceProduct.quantity += 1
                serviceProduct.quantity -= 1
            } else if (action === 'decrement') {
                if (existingServiceProduct.quantity > 1) {
                    existingServiceProduct.quantity -= 1
                    serviceProduct.quantity += 1
                } else {
                    cartList.ServicesAndProducts.splice(
                        existingServiceProductIndex,
                        1
                    )
                    serviceProduct.quantity += existingServiceProduct.quantity
                }
            }

            existingServiceProduct.subTotal =
                existingServiceProduct.quantity * serviceProduct.price
        } else {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.PRODUCT_NOT_FOUND_IN_CART,
            })
        }

        // cartList.totalamount =
        //     cartList.products.reduce(
        //         (total, product) => total + product.subTotal,
        //         0
        //     ) +
        //     cartList.ServicesAndProducts.reduce(
        //         (total, serviceProduct) => total + serviceProduct.subTotal,
        //         0
        //     )

        // cartList.totalQuantity =
        //     cartList.products.reduce(
        //         (total, product) => total + product.quantity,
        //         0
        //     ) +
        //     cartList.ServicesAndProducts.reduce(
        //         (total, serviceProduct) => total + serviceProduct.quantity,
        //         0
        //     )
        cartList.totalamount =
            cartList.products.reduce(
                (total, product) => total + (product.subTotal || 0),
                0
            ) +
            cartList.ServicesAndProducts.reduce(
                (total, serviceProduct) =>
                    total + (serviceProduct.subTotal || 0),
                0
            )

        cartList.totalQuantity =
            cartList.products.reduce(
                (total, product) => total + (product.quantity || 0),
                0
            ) +
            cartList.ServicesAndProducts.reduce(
                (total, serviceProduct) =>
                    total + (serviceProduct.quantity || 0),
                0
            )

        if (
            cartList.products.length === 0 &&
            cartList.ServicesAndProducts.length === 0
        ) {
            await Cart.deleteOne({ userId })
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_EMPTY,
            })
        }
        await cartList.save()
        // await (product || serviceProduct).save()

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PRODUCTADDCART,
            data: cartList,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const deleteCart = async (req, res) => {
    try {
        const userId = req.user
        const cartId = req.query.cartId

        const cartData = await Cart.findById(cartId)
        if (!cartData) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_NOT_FOUND,
            })
        }

        if (!cartData.userId.equals(new mongoose.Types.ObjectId(userId))) {
            return res.status(403).json({
                status: StatusCodes.FORBIDDEN,
                message: ResponseMessage.UNAUTHORIZED_ACCESS,
            })
        }

        for (const cartProduct of cartData.products) {
            const product = await Product.findById(cartProduct.productId)
            if (product) {
                product.quantity += cartProduct.quantity
                await product.save()
            }
        }

        for (const cartServiceProduct of cartData.ServicesAndProducts) {
            const serviceProduct = await ServicesProductList.findById(
                cartServiceProduct.ServicesProductId
            )
            if (serviceProduct) {
                serviceProduct.quantity += cartServiceProduct.quantity
                await serviceProduct.save()
            }
        }

        await Cart.deleteOne({ _id: cartId })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CART_DELETE,
            data: cartData,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const placeOrder = async (req, res) => {
    try {
        const userId = req.user
        const { productIds, servicesProductIds, applyCouponCode, amount, gst } =
            req.body
        // const shippingCharge = 50
        const serviceType = 'Stitching'
        if (
            (!Array.isArray(productIds) || productIds.length === 0) &&
            (!Array.isArray(servicesProductIds) ||
                servicesProductIds.length === 0)
        ) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.PRODUCT_NOT_SELECTED,
            })
        }

        // Fetch cart items
        const cart = await Cart.findOne({ userId })
            .populate('products.productId')
            .populate('ServicesAndProducts.ServicesProductId')

        if (
            (!cart || cart.products.length === 0) &&
            (!cart || cart.ServicesAndProducts.length === 0)
        ) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_EMPTY,
            })
        }

        let orderTotal = 0
        let discount = 0
        let grandTotal = 0

        const selectedProducts = cart.products.filter((p) => {
            const data = productIds.includes(p.productId._id.toString())
            return data
        })

        const selectedServicesProducts = cart.ServicesAndProducts.filter(
            (sp) => {
                const data = servicesProductIds.includes(
                    sp.ServicesProductId._id.toString()
                )
                return data
            }
        )

        if (
            selectedProducts.length === 0 &&
            selectedServicesProducts.length === 0
        ) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.PRODUCT_NOT_FOUND_IN_CART,
            })
        }

        // Verify available stock for selected products
        for (const cartProduct of selectedProducts) {
            const product = await Product.findById(cartProduct.productId._id)
            if (!product || product.quantity < cartProduct.quantity) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message:
                        ResponseMessage.INSUFFICIENT_SERVICE_PRODUCT_QUANTITY,
                })
            }
        }

        // Verify available stock for selected service products
        for (const cartServiceProduct of selectedServicesProducts) {
            const serviceProduct = await ServicesProductList.findById(
                cartServiceProduct.ServicesProductId._id
            )
            if (
                !serviceProduct ||
                serviceProduct.quantity < cartServiceProduct.quantity
            ) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message:
                        ResponseMessage.INSUFFICIENT_SERVICE_PRODUCT_QUANTITY,
                })
            }
        }

        // Calculate order total for regular products
        for (const cartProduct of selectedProducts) {
            orderTotal += cartProduct.subTotal
        }

        // Calculate order total for service products
        for (const cartServiceProduct of selectedServicesProducts) {
            orderTotal += cartServiceProduct.subTotal
        }

        // Check and apply coupon
        let coupon
        if (applyCouponCode) {
            const isValidObjectId =
                mongoose.Types.ObjectId.isValid(applyCouponCode)

            if (isValidObjectId) {
                coupon = await DiscountAndOffer.findOne({
                    _id: applyCouponCode,
                    status: 'active',
                    maxUsageCount: { $gt: 0 },
                    isActive: true,
                })

                if (coupon) {
                    const couponUsage = await CouponUsage.findOne({
                        userId,
                        couponId: applyCouponCode,
                    })

                    if (
                        couponUsage &&
                        couponUsage.usageCount >= coupon.maxUsageCount
                    ) {
                        return res.status(400).json({
                            status: StatusCodes.BAD_REQUEST,
                            message: ResponseMessage.COUPON_REACH_MAX_LIMIT,
                        })
                    }

                    let applicableProducts = []
                    let applicableServicesProducts = []

                    if (coupon.serviceProductType === 'product') {
                        applicableProducts = coupon.productId.filter((id) =>
                            productIds.includes(id)
                        )
                    } else if (coupon.serviceProductType === 'service') {
                        applicableServicesProducts = coupon.serviceId.filter(
                            (id) =>
                                servicesProductIds.filter(
                                    (sProductId) => sProductId.serviceId === id
                                )
                        )

                        applicableServicesProducts =
                            applicableServicesProducts.toString()
                    }

                    if (
                        applicableProducts.length > 0 ||
                        applicableServicesProducts.length > 0
                    ) {
                        let applicableOrderTotal = 0

                        if (applicableProducts.length > 0) {
                            for (const cartProduct of selectedProducts) {
                                if (
                                    applicableProducts.includes(
                                        cartProduct.productId._id
                                    )
                                ) {
                                    applicableOrderTotal += cartProduct.subTotal
                                }
                            }
                        }
                        if (applicableServicesProducts.length > 0) {
                            for (const cartServiceProduct of selectedServicesProducts) {
                                if (
                                    applicableServicesProducts.includes(
                                        cartServiceProduct.ServicesProductId
                                            .serviceId
                                        // .serviceId
                                    )
                                ) {
                                    applicableOrderTotal +=
                                        cartServiceProduct.subTotal
                                }
                            }
                        }

                        if (coupon.discountType === 'percentage') {
                            discount =
                                (applicableOrderTotal * coupon.discountValue) /
                                100
                        } else if (coupon.discountType === 'constant') {
                            discount = coupon.discountValue
                        }

                        // coupon.maxUsageCount -= 1
                        coupon.totalUsedCount += 1
                        await coupon.save()

                        // if (couponUsage) {
                        //     couponUsage.usageCount += 1;
                        //     couponUsage.lastUsedAt = Date.now();
                        //     await couponUsage.save();
                        //   } else {
                        //     await CouponUsage.create({
                        //       userId,
                        //       couponId: applyCouponCode,
                        //       usageCount: 1,
                        //     });
                        //   }
                    } else {
                        return res.status(400).json({
                            status: StatusCodes.BAD_REQUEST,
                            message: ResponseMessage.COUPON_NOT_APPLICABLE,
                        })
                    }
                } else {
                    return res.status(400).json({
                        status: StatusCodes.BAD_REQUEST,
                        message: ResponseMessage.INVALID_COUPON,
                    })
                }
            } else {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.INVALID_COUPON,
                })
            }
        }

        grandTotal = orderTotal - discount
        const totalPayAmount = grandTotal + gst
        //  + shippingCharge
        const reamingAmountToPay = totalPayAmount - amount
        // const newOrderId = await generateOrderId()
        const newOrderId = await generateBookingId()

        const userDetails = await User.findOne({ _id: userId })
        const userEmail = userDetails ? userDetails.email : ''
        const userName = userDetails ? userDetails.name : ''
        const userMobileNumber = userDetails ? userDetails.phoneNumber : ''
        const userAddress = userDetails ? userDetails.address : ''
        const userCity = userDetails ? userDetails.city : ''
        const userCountry = userDetails ? userDetails.country : ''
        const userState = userDetails ? userDetails.state : ''
        const userZipCode = userDetails ? userDetails.zipCode : ''

        const name = req.body.name
        const email = req.body.email
        const phoneNumber = req.body.phoneNumber
        const address = req.body.address
        const city = req.body.city
        const state = req.body.state
        const country = req.body.country
        const zipCode = req.body.zipCode

        // Re-verify stock availability before finalizing the order and proceeding with payment
        for (const cartProduct of selectedProducts) {
            const product = await Product.findById(cartProduct.productId._id)
            if (!product || product.quantity < cartProduct.quantity) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message:
                        ResponseMessage.INSUFFICIENT_SERVICE_PRODUCT_QUANTITY,
                })
            }
        }

        for (const cartServiceProduct of selectedServicesProducts) {
            const serviceProduct = await ServicesProductList.findById(
                cartServiceProduct.ServicesProductId._id
            )
            if (
                !serviceProduct ||
                serviceProduct.quantity < cartServiceProduct.quantity
            ) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message:
                        ResponseMessage.INSUFFICIENT_SERVICE_PRODUCT_QUANTITY,
                })
            }
        }

        // Create order
        const order = await Booking.create({
            bookingId: newOrderId,
            userId,
            products: selectedProducts.map((p) => ({
                productId: p.productId._id,
                quantity: p.quantity,
                price: p.price,
                subTotal: p.subTotal,
            })),
            ServicesAndProducts: selectedServicesProducts.map((sp) => ({
                ServicesProductId: sp.ServicesProductId._id,
                quantity: sp.quantity,
                price: sp.price,
                subTotal: sp.subTotal,
                serviceId: sp.serviceId,
                superCategoryId: sp.superCategoryId,
                categoryId: sp.categoryId,
                subCategoryId: sp.subCategoryId,
                fabricServiceType: sp.fabricServiceType,
                customize: {
                    customizeSize: sp.customize.customizeSize,
                    customizeColor: sp.customize.customizeColor,
                    customizeAdditional: sp.customize.customizeAdditional,
                    image: sp.customize.image,
                },
            })),
            totalQuantity:
                selectedProducts.reduce((sum, p) => sum + p.quantity, 0) +
                selectedServicesProducts.reduce(
                    (sum, sp) => sum + sp.quantity,
                    0
                ),
            couponId: coupon ? coupon._id : null,
            couponCode: coupon ? coupon.couponCode : null,
            orderTotal,
            reamingAmount: reamingAmountToPay,
            discount,
            grandTotal,
            serviceType,
            // shippingCharge: shippingCharge,
            gst,
            totalPayAmount,
            bookingDateTime: req.body.bookingDateTime,
            email: userEmail,
            expertId: req.body.expertId,
            ...(req.body.type !== 'online' && req.body),
            deliveryAddress: {
                name: name || userName,
                email: email || userEmail,
                phoneNumber: phoneNumber || userMobileNumber,
                address: address || userAddress,
                city: city || userCity,
                state: state || userState,
                country: country || userCountry,
                zipCode: zipCode || userZipCode,
            },
        })

        if (order) {
            const transaction = await new Transaction({
                userId,
                expertId: order.expertId,
                bookingId: order.bookingId,
                bookingPartialPayAmount: order.amount,
                paymentId: order.paymentId,
                paymentStatus: order.paymentStatus,
                paymentResponse: order.paymentResponse,
            })
            await transaction.save()
        }

        const myCouponUsage = await CouponUsage.findOne({
            userId,
            couponId: applyCouponCode,
        })
        if (myCouponUsage) {
            myCouponUsage.usageCount += 1
            myCouponUsage.lastUsedAt = Date.now()
            await myCouponUsage.save()
        } else {
            await CouponUsage.create({
                userId,
                couponId: applyCouponCode,
                usageCount: 1,
            })
        }
        // Update product quantities and remove selected products from the cart
        for (const cartProduct of selectedProducts) {
            const product = await Product.findById(cartProduct.productId._id)
            if (product) {
                product.quantity -= cartProduct.quantity
                await product.save()
            }
        }

        // Update service product quantities and remove selected service products from the cart
        for (const cartServiceProduct of selectedServicesProducts) {
            const serviceProduct = await ServicesProductList.findById(
                cartServiceProduct.ServicesProductId._id
            )
            if (serviceProduct) {
                serviceProduct.quantity -= cartServiceProduct.quantity
                await serviceProduct.save()
            }
        }

        // Remove selected products and services products from the cart
        cart.products = cart.products.filter(
            (p) => !productIds.includes(p.productId._id.toString())
        )
        cart.ServicesAndProducts = cart.ServicesAndProducts.filter(
            (sp) =>
                !servicesProductIds.includes(
                    sp.ServicesProductId._id.toString()
                )
        )
        cart.totalamount =
            cart.products.reduce((sum, p) => sum + p.subTotal, 0) +
            cart.ServicesAndProducts.reduce((sum, sp) => sum + sp.subTotal, 0)

        cart.totalQuantity =
            cart.products.reduce((sum, p) => sum + p.quantity, 0) +
            cart.ServicesAndProducts.reduce((sum, sp) => sum + sp.quantity, 0)
        // Check if cart is empty and delete it if so
        if (
            cart.products.length === 0 &&
            cart.ServicesAndProducts.length === 0
        ) {
            await Cart.deleteOne({ userId })
        } else {
            await cart.save()
        }

        return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.ORDER_PLACED,
            data: order,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

// export const editPlaceOrder = async (req, res) => {
//     try {
//       let bookingId = req.query.id;
//       const { measurements, ServicesProductId } = req.body;

//       console.log(req.body);

//       let measurementsEditBy = req.user || req.expert || req.admin;
//       let referModel = '';

//       if (measurementsEditBy) {
//         const models = [User, Expert, Admin];

//         for (const Model of models) {
//           let entity = await Model.findOne({ _id: measurementsEditBy });

//           if (entity) {
//             referModel = Model.modelName;
//             measurementsEditBy = entity._id;
//             break;
//           }
//         }

//       }

//       const updateData = {
//         measurements: measurements,
//         measurementsEditBy: measurementsEditBy,
//         referModel: referModel,
//       };

//       const booking = await Booking.findOneAndUpdate(
//         { _id: bookingId, "ServicesAndProducts.ServicesProductId": ServicesProductId },
//         {
//           $set: {
//             "ServicesAndProducts.$.measurements": updateData.measurements,
//             "ServicesAndProducts.$.measurementsEditBy": updateData.measurementsEditBy,
//             "ServicesAndProducts.$.referModel": updateData.referModel,
//           },
//         },
//         { new: true }
//       );

//       if (!booking) {
//         return res.status(404).json({
//           status: StatusCodes.NOT_FOUND,
//           message: "Booking not found",
//         });
//       }

//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.ORDER_PLACED,
//         data: booking,
//       });

//     } catch (error) {
//       console.error(error);
//       return handleErrorResponse(res, error);
//     }
//   };

export const editPlaceOrder = async (req, res) => {
    try {
        let bookingId = req.query.id
        const {
            measurements,
            ServicesProductId,
            sameMeasurementForAllProduct,
        } = req.body
        let measurementsEditBy = req.user || req.expert || req.admin
        let referModel = ''

        if (measurementsEditBy) {
            const models = [User, expert, admin]

            for (const Model of models) {
                let entity = await Model.findOne({ _id: measurementsEditBy })

                if (entity) {
                    referModel = Model.modelName
                    measurementsEditBy = entity._id
                    break
                }
            }
        }

        const updateData = {
            measurements: measurements,
            measurementsEditBy: measurementsEditBy,
            referModel: referModel,
        }

        let booking
        if (sameMeasurementForAllProduct) {
            // Update measurements for all ServicesAndProducts
            booking = await Booking.findOneAndUpdate(
                { _id: bookingId },
                {
                    $set: {
                        'ServicesAndProducts.$[].measurements':
                            updateData.measurements,
                        'ServicesAndProducts.$[].measurementsEditBy':
                            updateData.measurementsEditBy,
                        'ServicesAndProducts.$[].referModel':
                            updateData.referModel,
                    },
                },
                { new: true, multi: true }
            )
        } else {
            // Update measurements for the specified ServicesProductId
            booking = await Booking.findOneAndUpdate(
                {
                    _id: bookingId,
                    'ServicesAndProducts.ServicesProductId': ServicesProductId,
                },
                {
                    $set: {
                        'ServicesAndProducts.$.measurements':
                            updateData.measurements,
                        'ServicesAndProducts.$.measurementsEditBy':
                            updateData.measurementsEditBy,
                        'ServicesAndProducts.$.referModel':
                            updateData.referModel,
                    },
                },
                { new: true }
            )
        }

        if (!booking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: 'Booking not found',
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_PLACED,
            data: booking,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const getQuotations = async (req, res) => {
    try {
        const userId = req.user
        // let bookingId = req.query.id

        const findQuotations = await Quotation.find({ userId }).sort({
            createdAt: -1,
        })

        for (let data of findQuotations) {
            await data.populate({
                path: 'bookingId',
                select: 'bookingDateTime bookingId orderId bookingCancel bookingType serviceType status',
                populate: {
                    path: 'ServicesAndProducts',
                    select: 'serviceName productId productName',
                },
            })
            await data.populate({
                path: 'bookingId.ServicesAndProducts',
                populate: {
                    path: 'ServicesProductId',
                    select: 'name',
                },
            })

            await data.populate({
                path: 'userId',
                select: 'name email phoneNumber',
            })
            await data.populate({
                path: 'expertId',
                select: 'name email phoneNumber address city country state zipCode',
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.QUOTATION_FETCHED,
            data: findQuotations,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
export const getQuotationsByExpert = async (req, res) => {
    try {
        const expertId = req.expert
        // let bookingId = req.query.id

        const findQuotations = await Quotation.find({ expertId })

        for (let data of findQuotations) {
            // Use `execPopulate()` to handle the population on nested paths
            await data.populate({
                path: 'bookingId',
                select: 'bookingId bookingDateTime bookingType',
            })

            await data.populate({
                path: 'expertId',
                select: 'name',
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.QUOTATION_FETCHED,
            data: findQuotations,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
// export const getSingleQuotationsByExpert = async (req, res) => {
//     try {
//         const expertId = req.expert
//         let bookingId = req.query.id

//         const findQuotations = await Quotation.find({ expertId, bookingId })

//         for (let data of findQuotations) {
//             // Use `execPopulate()` to handle the population on nested paths
//             await data.populate({
//                 path: 'bookingId',
//                 select: 'bookingId bookingDateTime bookingType',
//             })

//             await data.populate({
//                 path: 'expertId',
//                 select: 'name',
//             })
//         }

//         return res.status(200).json({
//             status: StatusCodes.OK,
//             message: ResponseMessage.QUOTATION_FETCHED,
//             data: findQuotations,
//         })
//     } catch (error) {
//         console.error(error)
//         return handleErrorResponse(res, error)
//     }
// }

// export const getSingleQuotationsByUser = async (req, res) => {
//     try {
//         const userId = req.user
//         let bookingId = req.query.id

//         const findQuotations = await Quotation.findOne({ userId, bookingId })

//         if (!findQuotations) {
//             return res.status(404).json({
//                 status: StatusCodes.NOT_FOUND,
//                 message: ResponseMessage.QUOTATION_NOT_FOUND,
//             })
//         }

//         await findQuotations.populate({
//             path: 'bookingId',
//             select: 'bookingId bookingDateTime bookingType',
//         })

//         await findQuotations.populate({
//             path: 'userId',
//             select: 'name',
//         })

//         return res.status(200).json({
//             status: StatusCodes.OK,
//             message: ResponseMessage.QUOTATION_FETCHED,
//             data: findQuotations,
//         })
//     } catch (error) {
//         console.error(error)
//         return handleErrorResponse(res, error)
//     }
// }

export const getSingleQuotation = async (req, res) => {
    try {
        let findQuotations
        let populatePath

        if (req.user) {
            const userId = req.user
            let bookingId = req.query.id

            findQuotations = await Quotation.findOne({ userId, bookingId })

            if (!findQuotations) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.QUOTATION_NOT_FOUND,
                    data: null,
                })
            }

            populatePath = {
                path: 'expertId userId',
                select: 'name email phoneNumber image address city country state zipCode',
            }
        } else if (req.expert) {
            const expertId = req.expert
            let bookingId = req.query.id

            findQuotations = await Quotation.findOne({ expertId, bookingId })

            if (!findQuotations) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.QUOTATION_NOT_FOUND,
                    data: null,
                })
            }

            populatePath = {
                path: 'expertId userId',
                select: 'name email phoneNumber image address city country state zipCode',
            }
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: 'User or Expert ID is required',
                data: null,
            })
        }

        await findQuotations.populate({
            path: 'bookingId',
            select: 'bookingId bookingDateTime bookingType',
        })

        await findQuotations.populate(populatePath)

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.QUOTATION_FETCHED,
            data: findQuotations,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const addQuotations = async (req, res) => {
    try {
        let bookingId = req.query.id
        const {
            name,
            stitchingAmount,
            fabricQuality,
            fabricLength,
            fabricAmount,
        } = req.body

        const findBookingDetails = await Booking.findById({ _id: bookingId })
        if (!findBookingDetails) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ORDER_NOT_FOUND,
            })
        }

        const multipleFiles = req.files['image']
            ? req.files['image'].map((e) => ({ file: e.filename }))
            : []

        const validFabricAmount =
            fabricAmount && parseInt(fabricAmount) !== 0
                ? parseInt(fabricAmount)
                : 0

        const Amount = validFabricAmount + parseInt(stitchingAmount)

        // const Amount = parseInt(fabricAmount) + parseInt(stitchingAmount)

        const totalAmount = Amount ? Amount : 0
        const updateData = {
            userId: findBookingDetails.userId,
            expertId: findBookingDetails.expertId,
            bookingId: findBookingDetails._id,
            stitchingAmount,
            name,
            fabricQuality,
            fabricLength,
            fabricAmount: validFabricAmount,
            totalAmount,

            quotationStatus: 'pending',
            fabricImage:
                multipleFiles !== null &&
                multipleFiles !== '' &&
                multipleFiles.length > 0
                    ? multipleFiles
                    : [],
        }

        const booking = await Quotation.findByIdAndUpdate(
            { _id: bookingId },
            updateData,
            {
                new: true,
                upsert: true,
            }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_PLACED,
            data: booking,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const quotationReject = async (req, res) => {
    try {
        let quotationId = req.query.id
        const booking = await Quotation.findByIdAndUpdate(
            { _id: quotationId },
            {
                $set: {
                    quotationStatus: 'reject',
                },
            },
            { new: true }
        )

        await Booking.findByIdAndUpdate(
            { _id: booking.bookingId },
            { $set: { refundStatus: 'pending' } },
            { new: true }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.QUOTATION_REJECTED,
            data: booking,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const cancelOrder = async (req, res) => {
    let userId = req.user
    let orderId = req.query.orderId
    const order = await Booking.findOne({ _id: orderId, userId })
    if (!order) {
        return res.status(404).json({
            status: StatusCodes.NOT_FOUND,
            message: ResponseMessage.ORDER_NOT_FOUND,
        })
    }
    if (order.orderStatus === 'cancelled') {
        return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.ORDER_ALREADY_CANCELLED,
        })
    }
    order.orderStatus = 'cancelled'
    await order.save()
    return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ORDER_CANCELLED,
        order,
    })
}

export const applyCouponCode = async (req, res) => {
    try {
        const userId = req.user
        const { productIds, servicesProductIds, applyCouponCode } = req.body
        // const shippingCharge = 50
        let now = moment()
        if (
            (!Array.isArray(productIds) || productIds.length === 0) &&
            (!Array.isArray(servicesProductIds) ||
                servicesProductIds.length === 0)
        ) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.PRODUCT_NOT_SELECTED,
            })
        }

        // Fetch cart items
        const cart = await Cart.findOne({ userId })
            .populate('products.productId')
            .populate('ServicesAndProducts.ServicesProductId')

        if (
            (!cart || cart.products.length === 0) &&
            (!cart || cart.ServicesAndProducts.length === 0)
        ) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.CART_EMPTY,
            })
        }

        let orderTotal = 0
        let discount = 0
        let grandTotal = 0

        const selectedProducts = cart.products.filter((p) => {
            const data = productIds.includes(p.productId._id.toString())
            return data
        })

        const selectedServicesProducts = cart.ServicesAndProducts.filter(
            (sp) => {
                const data = servicesProductIds.includes(
                    sp.ServicesProductId._id.toString()
                )
                return data
            }
        )

        if (
            selectedProducts.length === 0 &&
            selectedServicesProducts.length === 0
        ) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.PRODUCT_NOT_FOUND_IN_CART,
            })
        }

        // Calculate order total for regular products
        for (const cartProduct of selectedProducts) {
            orderTotal += cartProduct.subTotal
        }

        // Calculate order total for service products
        for (const cartServiceProduct of selectedServicesProducts) {
            orderTotal += cartServiceProduct.subTotal
        }

        // Check and apply coupon
        let coupon
        if (applyCouponCode) {
            const isValidObjectId =
                mongoose.Types.ObjectId.isValid(applyCouponCode)

            if (isValidObjectId) {
                updateCouponStatus()
                coupon = await DiscountAndOffer.findOne({
                    _id: applyCouponCode,
                    status: 'active',
                    maxUsageCount: { $gt: 0 },
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                    isActive: true,
                    isDeleted: false,
                })
                if (coupon) {
                    const couponUsage = await CouponUsage.findOne({
                        userId,
                        couponId: applyCouponCode,
                    })
                    if (
                        couponUsage &&
                        couponUsage.usageCount >= coupon.maxUsageCount
                    ) {
                        return res.status(400).json({
                            status: StatusCodes.BAD_REQUEST,
                            message: ResponseMessage.COUPON_REACH_MAX_LIMIT,
                        })
                    }
                    // if (coupon) {
                    //     if (coupon.totalUsedCount >= coupon.maxUsageCount) {
                    //         console.log(
                    //             coupon.totalUsedCount >= coupon.maxUsageCount
                    //         )
                    //         return res.status(400).json({
                    //             status: StatusCodes.BAD_REQUEST,
                    //             message: ResponseMessage.COUPON_REACH_MAX_LIMIT,
                    //         })
                    //     }

                    let applicableProducts = []
                    let applicableServicesProducts = []

                    if (coupon.serviceProductType === 'product') {
                        applicableProducts = coupon.productId.filter((id) =>
                            productIds.includes(id)
                        )
                    } else if (coupon.serviceProductType === 'service') {
                        applicableServicesProducts = coupon.serviceId.filter(
                            (id) =>
                                servicesProductIds.filter(
                                    (sProductId) => sProductId.serviceId === id
                                )
                        )

                        applicableServicesProducts =
                            applicableServicesProducts.toString()
                    }

                    if (
                        applicableProducts.length > 0 ||
                        applicableServicesProducts.length > 0
                    ) {
                        let applicableOrderTotal = 0

                        if (applicableProducts.length > 0) {
                            for (const cartProduct of selectedProducts) {
                                if (
                                    applicableProducts.includes(
                                        cartProduct.productId._id
                                    )
                                ) {
                                    applicableOrderTotal += cartProduct.subTotal
                                }
                            }
                        }
                        if (applicableServicesProducts.length > 0) {
                            for (const cartServiceProduct of selectedServicesProducts) {
                                if (
                                    applicableServicesProducts.includes(
                                        cartServiceProduct.ServicesProductId
                                            .serviceId
                                        // .serviceId
                                    )
                                ) {
                                    applicableOrderTotal +=
                                        cartServiceProduct.subTotal
                                }
                            }
                        }

                        if (coupon.discountType === 'percentage') {
                            discount =
                                (applicableOrderTotal * coupon.discountValue) /
                                100
                        } else if (coupon.discountType === 'constant') {
                            discount = coupon.discountValue
                        }
                    } else {
                        return res.status(400).json({
                            status: StatusCodes.BAD_REQUEST,
                            message: ResponseMessage.COUPON_NOT_APPLICABLE,
                        })
                    }
                } else {
                    return res.status(400).json({
                        status: StatusCodes.BAD_REQUEST,
                        message: ResponseMessage.INVALID_COUPON,
                    })
                }
            } else {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: ResponseMessage.INVALID_COUPON,
                })
            }
        }

        grandTotal = orderTotal - discount
        const totalPayAmount = grandTotal
        // + shippingCharge

        // Create order summery
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.COUPON_VALID,
            data: {
                products: selectedProducts.map((p) => ({
                    productId: p.productId._id,
                    quantity: p.quantity,
                    price: p.price,
                    subTotal: p.subTotal,
                })),
                ServicesAndProducts: selectedServicesProducts.map((sp) => ({
                    ServicesProductId: sp.ServicesProductId._id,
                    quantity: sp.quantity,
                    price: sp.price,
                    subTotal: sp.subTotal,
                    serviceId: sp.serviceId,
                    superCategoryId: sp.superCategoryId,
                    categoryId: sp.categoryId,
                    subCategoryId: sp.subCategoryId,
                })),
                totalQuantity:
                    selectedProducts.reduce((sum, p) => sum + p.quantity, 0) +
                    selectedServicesProducts.reduce(
                        (sum, sp) => sum + sp.quantity,
                        0
                    ),
                couponId: coupon ? coupon._id : null,
                couponCode: coupon ? coupon.couponCode : null,
                orderTotal,
                discount,
                grandTotal,
                // shippingCharge: shippingCharge,
                totalPayAmount,
            },
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

const updateCouponStatus = async () => {
    try {
        const now = moment()
        const query = {
            endDate: { $lt: now.toDate() },
            status: 'active',
        }
        await DiscountAndOffer.updateMany(query, {
            $set: { status: 'inactive' },
        })
    } catch (error) {
        console.error('Error updating coupon status:', error)
    }
}

export const getOrderList = async (req, res) => {
    const userId = req.user

    try {
        const orderList = await Booking.find({ userId: userId })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts',
                populate: {
                    path: 'ServicesProductId',
                    model: 'ServicesProductList',
                },
            })

        let bookingDetails = []

        if (req.query.type === 'currentBooking') {
            const currentDate = Date.now()
            // const oneMonthAgo = Date.now()

            // oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

            // Filter orders that occurred within the past month

            bookingDetails = orderList?.filter((order) => {
                console.log(order)
                // const orderDate = new Date(order.bookingDateTime)
                return order.bookingDateTime >= currentDate //order.bookingDateTime >= oneMonthAgo
            })
        }

        if (req.query.type === 'pastBooking') {
            // const currentDate = new Date()
            const currentDate = Date.now()

            // Filter orders that occurred more than one month ago
            bookingDetails = orderList.filter((order) => {
                // const orderDate = new Date(order.createdAt)
                return order.bookingDateTime <= currentDate
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_LIST,
            data: bookingDetails, // Return filtered booking details
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const updateOrder = async (req, res) => {
    // const userId = req.user
    try {
        const myorder = await Order.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            {
                new: true,
            }
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: 'ResponseMessage.ORDER_UPDATED',
            data: myorder,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

// export const bookingConvertToOrder = async (req, res) => {
//     const userId = req.user
//     const { bookingId, PayAmount } = req.body
//     try {
//         let order
//         let newOrderId
//         let transaction
//         let updateBookingData
//         let booking = await Booking.findById({ _id: bookingId, userId })
//         let quotationDetails = await Quotation.findOne({
//             bookingId,
//         })
//         const findOrder = await Order.findOne({ bookingId: bookingId })
//         if (findOrder) {
//             // If order already exists, update it
//             newOrderId = findOrder.orderId

//             const reaminggAmount = findOrder.quotationPartialPendingAmount || 0

//             // Update payment details
//             const newPaymentDetails = {
//                 paymentId: req.body.paymentId,
//                 paymentStatus: req.body.paymentStatus,
//                 paymentResponse: req.body.paymentResponse,
//             }

//             const totalPartialPay =
//                 findOrder.totalPartialPayAmount + parseInt(PayAmount)
//             let quotationPartialPayAmount = parseInt(PayAmount)
//             let quotationPartialPendingAmount =
//                 reaminggAmount - parseInt(PayAmount)
//      parseInt(findOrder.quotationTotalAmount)

//             const orderPaymentStatus =
//                 quotationPartialPendingAmount === 0 ? 'Paid' : 'Partial Paid'

//             // Update order with new details
//             await Order.updateOne(
//                 { orderId: newOrderId },
//                 {
//                     $set: {
//                         totalPartialPayAmount: totalPartialPay,
//                         quotationPartialPayAmount:
//                             findOrder.quotationPartialPayAmount +
//                             findOrder.quotationPartialPendingAmount,
//                         quotationPartialPendingAmount,
//                         orderPaymentStatus,
//                     },
//                     $push: { paymentDetails: newPaymentDetails },
//                 }
//             )

//             order = await Order.findOne({ orderId: newOrderId })

//       await Quotation.findOneAndUpdate(
//                 { bookingId: bookingId },
//                 {
//                     $set: {isFullAmountPaid: true },
//                 },
//                 {
//                     new: true,
//                 }
//             )

//             transaction = {
//                 userId,
//                 expertId: booking.expertId,
//                 orderId: newOrderId,
//                 bookingId: booking.bookingId,
//                 orderPartialPayAmount: quotationPartialPayAmount,
//                 paymentId: req.body.paymentId,
//                 paymentStatus: req.body.paymentStatus,
//                 paymentResponse: req.body.paymentResponse,
//                 orderPaymentStatus:
//                     quotationPartialPendingAmount === 0
//                         ? 'Paid'
//                         : 'Partial Paid',
//             }

//             await Transaction.create(transaction)
//             updateBookingData = {
//                 orderId: order.orderId,
//                 orderDateTime: order.orderDateTime,
//                 // deliveryDateTime: order.deliveryDateTime,
//                 paymentDetails: order.paymentDetails,
//                 quotationPartialPendingAmount:
//                     order.quotationPartialPendingAmount,
//                 quotationPartialPayAmount: order.quotationPartialPayAmount,
//                 quotationTotalAmount: order.quotationTotalAmount,
//                 orderStatus: order.status,
//                 orderPaymentStatus:
//                     quotationPartialPendingAmount === 0
//                         ? 'Paid'
//                         : 'Partial Paid',
//             }

//             await Booking.findByIdAndUpdate(
//                 //    const orderDetails =
//                 { _id: bookingId },
//                 {
//                     $set: updateBookingData,
//                     // $push: {
//                     //     updates: updateBookingData
//                     // }
//                 },
//                 {
//                     new: true,
//                 }
//             )

//             return res.status(200).json({
//                 status: StatusCodes.OK,
//                 message: ResponseMessage.ORDER_CONVERTED,
//                 data: order,
//             })
//         } else {
//             // const booking = await Booking.findById({ _id: bookingId, userId })
//             // const quotationDetails = await Quotation.findOne({
//             //     bookingId,
//             // })
//             newOrderId = await generateOrderId()
//             // const newShipmentId = await generateShipmentId()
//             const totalPartialPay =
//                 parseInt(booking.amount) + parseInt(PayAmount)
//             let quotationPartialPayAmount = parseInt(PayAmount)
//             let quotationPartialPendingAmount =
//                 parseInt(quotationDetails.totalAmount) - parseInt(PayAmount)
//             let quotationTotalAmount =
//                 parseInt(quotationPartialPendingAmount) +
//                 parseInt(totalPartialPay)

//             const paymentDetails = [
//                 {
//                     paymentId: req.body.paymentId,
//                     paymentStatus: req.body.paymentStatus,
//                     paymentResponse: req.body.paymentResponse,
//                 },
//             ]

//             quotationDetails.quotationStatus = 'accept'
//             quotationDetails.isAccepted = true

//             if (quotationPartialPendingAmount > 0) {
//                 quotationDetails.isFabricAmountPaid = true
//             }
//             if (quotationPartialPendingAmount == 0) {
//                 quotationDetails.isFabricAmountPaid = true
//                 quotationDetails.isFullAmountPaid = true
//             }

//             quotationDetails.save()

//             order = new Order({
//                 orderId: newOrderId,
//                 bookingId: bookingId,
//                 userId: userId,
//                 expertId: booking.expertId,
//                 orderDateTime: booking.bookingDateTime,
//                 // deliveryDateTime: booking.bookingDateTime,
//                 paymentDetails: paymentDetails,
//                 totalPartialPayAmount: totalPartialPay,
//                 quotationPartialPayAmount,
//                 quotationPartialPendingAmount,
//                 quotationTotalAmount,
//                 orderPaymentStatus:
//                     quotationPartialPendingAmount === 0
//                         ? 'Paid'
//                         : 'Partial Paid',
//             })

//             transaction = {
//                 userId,
//                 expertId: booking.expertId,
//                 orderId: newOrderId,
//                 bookingId: bookingId,
//                 orderPartialPayAmount: quotationPartialPayAmount,
//                 paymentId: req.body.paymentId,
//                 paymentStatus: req.body.paymentStatus,
//                 paymentResponse: req.body.paymentResponse,
//                 orderPaymentStatus:
//                     quotationPartialPendingAmount === 0
//                         ? 'Paid'
//                         : 'Partial Paid',
//             }

//             await Transaction.create(transaction)

//             updateBookingData = {
//                 orderId: order.orderId,
//                 orderDateTime: order.orderDateTime,
//                 // deliveryDateTime: order.deliveryDateTime,
//                 paymentDetails: order.paymentDetails,
//                 quotationPartialPendingAmount:
//                     order.quotationPartialPendingAmount,
//                 quotationPartialPayAmount: order.quotationPartialPayAmount,
//                 quotationTotalAmount: order.quotationTotalAmount,
//                 orderStatus: order.status,
//                 orderPaymentStatus:
//                     quotationPartialPendingAmount === 0
//                         ? 'Paid'
//                         : 'Partial Paid',
//             }

//             await Booking.findByIdAndUpdate(
//                 //    const orderDetails =
//                 { _id: bookingId },
//                 {
//                     $set: updateBookingData,
//                     // $push: {
//                     //     updates: updateBookingData
//                     // }
//                 },
//                 {
//                     new: true,
//                 }
//             )

//             await order.save()

//             return res.status(200).json({
//                 status: StatusCodes.OK,
//                 message: ResponseMessage.ORDER_CONVERTED,
//                 data: order,
//             })
//         }
//     } catch (error) {
//         console.log(error)
//         return handleErrorResponse(res, error)
//     }
// }
export const bookingConvertToOrder = async (req, res) => {
    const userId = req.user
    const { bookingId, PayAmount } = req.body
    try {
        const booking = await Booking.findById({ _id: bookingId, userId })
        const quotationDetails = await Quotation.findOne({
            bookingId,
        })
        const newOrderId = await generateOrderId()
        const totalPartialPay = parseInt(booking.amount) + parseInt(PayAmount)
        let quotationPartialPayAmount =
            parseInt(quotationDetails.totalAmount) - parseInt(PayAmount)
        let quotationPartialPendingAmount =
            parseInt(quotationDetails.totalAmount) - parseInt(PayAmount)
        let quotationTotalAmount =
            parseInt(quotationPartialPendingAmount) + parseInt(totalPartialPay)

        quotationDetails.quotationStatus = 'accept'
        quotationDetails.isAccepted = true

        quotationDetails.save()
        const paymentDetails = [
            {
                paymentId: req.body.paymentId,
                paymentStatus: req.body.paymentStatus,
                paymentResponse: req.body.paymentResponse,
            },
        ]

        const order = new Order({
            orderId: newOrderId,
            bookingId: bookingId,
            userId: userId,
            expertId: booking.expertId,
            orderDateTime: booking.bookingDateTime,
            // deliveryDateTime: booking.bookingDateTime,
            paymentDetails: paymentDetails,
            totalPartialPayAmount: totalPartialPay,
            quotationPartialPayAmount,
            quotationPartialPendingAmount,
            quotationTotalAmount,
        })

        const transaction = {
            userId,
            orderId: newOrderId,
            bookingId: bookingId,
            amount: quotationTotalAmount,
            paymentId: req.body.paymentId,
            paymentStatus: req.body.paymentStatus,
            paymentResponse: req.body.paymentResponse,
        }

        await Transaction.create(transaction)

        const updateBookingData = {
            orderId: order.orderId,
            orderDateTime: order.orderDateTime,
            deliveryDateTime: order.deliveryDateTime,
            paymentDetails: order.paymentDetails,
            quotationPartialPendingAmount: order.quotationPartialPendingAmount,
            quotationPartialPayAmount: order.quotationPartialPayAmount,
            quotationTotalAmount: order.quotationTotalAmount,
            orderStatus: order.status,
        }

        await Booking.findByIdAndUpdate(
            //    const orderDetails =
            { _id: bookingId },
            {
                $set: updateBookingData,
                // $push: {
                //     updates: updateBookingData
                // }
            },
            {
                new: true,
            }
        )

        await order.save()

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_CONVERTED,
            data: order,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getOrderHistory = async (req, res) => {
    try {
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        const currentDateTimestamp = currentDate.getTime()

        const userId = req.user

        const orderList = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'ServicesAndProducts.ServicesProductId',
                    select: 'name productImage description',
                },
            })
            .populate({ path: 'expertId userId', select: 'name image' })

        let orderDetails = []

        // if (req.query.type === 'myOrders') {
        //     const oneMonthsAgoDate = new Date()
        //     oneMonthsAgoDate.setHours(0, 0, 0, 0)
        //     oneMonthsAgoDate.setMonth(oneMonthsAgoDate.getMonth() - 1)
        //     const oneMonthsAgoTimestamp = oneMonthsAgoDate.getTime()

        //     orderDetails = orderList.filter((orderList) => {
        //         const orderDateTime = new Date(orderList.orderDateTime)

        //         return (
        //             orderDateTime >= oneMonthsAgoTimestamp &&
        //             orderDateTime > currentDateTimestamp
        //         )

        //     })
        // }
        if (req.query.type === 'myOrders') {
            const oneMonthAgoDate = new Date()
            oneMonthAgoDate.setHours(0, 0, 0, 0)
            oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1)
            const oneMonthAgoTimestamp = oneMonthAgoDate.getTime()

            const upcomingOrders = orderList.filter((order) => {
                const orderDateTime = new Date(order.orderDateTime).getTime()
                return orderDateTime > currentDateTimestamp
            })

            const pastMonthOrders = orderList.filter((order) => {
                const orderDateTime = new Date(order.orderDateTime).getTime()
                return (
                    orderDateTime >= oneMonthAgoTimestamp &&
                    orderDateTime <= currentDateTimestamp
                )
            })

            orderDetails = [...upcomingOrders, ...pastMonthOrders]
        }

        if (req.query.type === 'orderhistory') {
            const sixMonthsAgoDate = new Date()
            sixMonthsAgoDate.setHours(0, 0, 0, 0)
            sixMonthsAgoDate.setMonth(sixMonthsAgoDate.getMonth() - 6)
            const sixMonthsAgoTimestamp = sixMonthsAgoDate.getTime()

            orderDetails = orderList.filter((orderList) => {
                const orderDateTime = new Date(
                    orderList.orderDateTime
                ).getTime()

                return (
                    orderDateTime >= sixMonthsAgoTimestamp &&
                    orderDateTime < currentDateTimestamp
                    //&& orderList.status === 'Delivered'
                )
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_LIST,
            data: orderDetails,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getAllOrderList = async (req, res) => {
    try {
        const orderList = await Order.find({})
            .populate('bookingId')
            .sort({ createdAt: -1 })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_LIST,
            data: orderList,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getSingleOrder = async (req, res) => {
    try {
        const { Id } = req.query
        const order = await Order.findById(Id)
            .populate('bookingId')
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'ServicesAndProducts.ServicesProductId',
                    select: 'name productImage',
                },
            })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_LIST,
            data: order,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body

        // Validate status against enum values
        if (
            !['Confirmed', 'In Progress', 'Shipped', 'Delivered'].includes(
                status
            )
        ) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: 'Invalid status value',
            })
        }

        const order = await Order.findByIdAndUpdate(
            { _id: req.body.id },
            { $set: { status: status } },
            {
                new: true,
            }
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_STATUS_UPDATE,
            data: order,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const orderCancel = async (req, res) => {
    try {
        let orderCanceledBy = req.user || req.expert || req.admin
        let referModel = ''
        let refundId = await generateRefundId()
        if (orderCanceledBy) {
            const models = [User, expert, admin]

            for (const Model of models) {
                let entity = await Model.findOne({ _id: orderCanceledBy })

                if (entity) {
                    referModel = Model.modelName
                    orderCanceledBy = entity._id
                    break
                }
            }
        }

        const { id, status } = req.query

        const order = await Order.findOne({ _id: id }).populate({
            path: 'userId expertId',
            select: 'name email',
        })

        if (!order) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ORDER_NOT_FOUND,
                data: [],
            })
        }

        if (order.orderCancel === true && order.status === 'Cancelled') {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.ORDER_ALREADY_CANCELLED,
                data: [],
            })
        }

        const nowUTC = new Date(Date.now() + 5.5 * 60 * 60 * 1000)

        const createdDateTime = new Date(order.createdAt)
        const cancellationDeadlineUTC = new Date(
            createdDateTime.getTime() + 24 * 60 * 60 * 1000
        )

        if (nowUTC.getTime() >= cancellationDeadlineUTC.getTime()) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.ORDER_CANCEL_DEADLINE_EXCEEDED,
                data: [],
            })
        }

        const orderCancel = await Order.findOneAndUpdate(
            { _id: id },
            {
                orderCancel: true,
                status: status,
                orderCanceledBy: orderCanceledBy,
                isApproved: false,
                referModel: referModel,
                orderRefund: 'Pending',
                orderCancelDate: Date.now(),
            },
            { new: true }
        )

        await Booking.findOneAndUpdate(
            { _id: orderCancel.bookingId },
            {
                bookingCancel: orderCancel.orderCancel,
                status: orderCancel.status,
                orderStatus: orderCancel.status,
                bookingCanceledBy: orderCancel.orderCanceledBy,
                isApproved: orderCancel.isApproved,
                referModel: referModel,
                bookingRefund: orderCancel.orderRefund,
                orderCancelDate: orderCancel.orderCancelDate,
            },
            { new: true }
        )

        const refund = {
            refundId: refundId,
            bookingId: orderCancel.bookingId,
            orderId: orderCancel._id,
            userId: orderCancel.userId,
            expertId: orderCancel.expertId,
            refundAmount: orderCancel.totalPartialPayAmount,
            orderStatus: orderCancel.status,
            orderCanceledBy: orderCanceledBy,
            referModel: referModel,
        }

        const existingRefund = await Refund.findOne({
            orderId: orderCancel._id,
        })

        if (existingRefund) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.REFUND_ALREADY_INITIATED,
            })
        }

        await Refund.create(refund)

        await orderCancelEmail(
            order.userId.email,
            order.expertId.email,
            order.orderId,
            status,
            referModel
        )

        await orderRefundEmail(
            order.userId.email,
            order.expertId.email,
            order.orderId,
            refund.orderStatus,
            referModel
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_CANCELLED,
            data: orderCancel,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const addShippingDetails = async (req, res) => {
    try {
        let orderId = req.query.id
        const { shippingDetails, deliveryDateTime } = req.body

        // Fetch the order to get the bookingId
        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ORDER_NOT_FOUND,
            })
        }

        // Fetch the booking using the bookingId from the order
        const booking = await Booking.findById(order.bookingId)

        if (!booking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.BOOKING_NOT_FOUND,
            })
        }

        // Extract Deliverylocation from the booking's deliveryAddress
        const deliveryLocation = `${booking.deliveryAddress.address}, ${booking.deliveryAddress.city}, ${booking.deliveryAddress.state}, ${booking.deliveryAddress.country}, ${booking.deliveryAddress.zipCode}`

        // Update shippingDetails with Deliverylocation
        shippingDetails.deliveryLocation = deliveryLocation

        //update status of delivery
        const statusOfDelivery = order.status
        shippingDetails.currentStatusOfShipment = statusOfDelivery

        const updateShippingDetails = {
            shippingDetails: shippingDetails,
        }

        const myorder = await Order.findOneAndUpdate(
            { _id: orderId },
            {
                $set: {
                    shippingDetails: updateShippingDetails.shippingDetails,
                    deliveryDateTime: deliveryDateTime,
                },
            },
            { new: true }
        )

        if (!myorder) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ORDER_NOT_FOUND,
            })
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_PLACED,
            data: myorder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

export const reorder = async (req, res) => {
    // const userId = req.user
    const id = req.query.id
    try {
        // Find the original order
        const originalOrder = await Order.findOne({ _id: id })
        if (!originalOrder) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ORDER_NOT_FOUND,
            })
        }

        // Find the booking associated with the original order
        const booking = await Booking.findById(originalOrder.bookingId)
        if (!booking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.BOOKING_NOT_FOUND,
            })
        }

        // Find the quotation associated with the booking
        const quotationDetails = await Quotation.findOne({
            bookingId: originalOrder.bookingId,
        })
        if (!quotationDetails) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.QUOTATION_NOT_FOUND,
            })
        }

        // Generate a new order ID
        const newOrderId = await generateOrderId()
        const paymentDetails = [
            {
                paymentId: req.body.paymentId,
                paymentStatus: req.body.paymentStatus,
                paymentResponse: req.body.paymentResponse,
            },
        ]
        let quotationPartialPendingAmount
        // Create the re-order with all total amount in pending amount
        const order = new Order({
            orderId: newOrderId,
            bookingId: originalOrder.bookingId,
            userId: originalOrder.userId,
            expertId: originalOrder.expertId,
            orderDateTime: Date.now(),
            totalPartialPayAmount: 0,
            quotationPartialPayAmount: 0,
            quotationPartialPendingAmount:
                quotationDetails.fabricAmount + booking.totalPayAmount,
            quotationTotalAmount:
                quotationDetails.fabricAmount + booking.totalPayAmount,
            paymentDetails: paymentDetails,
            shippingDetails: originalOrder.shippingDetails,
            orderType: 'reOrder',
            status: 'Pending',
            orderPaymentStatus:
                quotationPartialPendingAmount === 0 ? 'Paid' : 'Pending',
        })
        await order.save()
        const updateBookingData = {
            'reOrder.reOrderId': order.orderId,
            'reOrder.reOrderDateTime': order.orderDateTime,
            'reOrder.reOrderStatus': order.status,
        }
        await Booking.findByIdAndUpdate(
            //    const orderDetails =
            { _id: originalOrder.bookingId },
            {
                $set: updateBookingData,
                // $push: {
                //     updates: updateBookingData
                // }
            },
            {
                new: true,
            }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REORDER_CREATED,
            data: order,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
