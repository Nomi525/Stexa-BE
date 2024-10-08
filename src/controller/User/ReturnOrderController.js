import { ResponseMessage } from '../../utils/ResponseMessage.js'
import StatusCodes from 'http-status-codes'
import Expert from '../../models/Expert.js'

import Booking from '../../models/Booking.js'
import ReturnOrder from '../../models/ReturnOrder.js'
import {
    generateRefundId,
    generateReturnId,
    handleErrorResponse,
} from '../../services/CommonService.js'
import Order from '../../models/PlaceOrder.js'
import Refund from '../../models/Refund.js'
import {
    orderReturnEmail,
    orderReturnStatusUpdateByExpertEmail,
    orderReturnStatusUpdateEmail,
    orderReturnNotifyExpertEmail,
    orderReturnRefundStatusUpdateEmail,
} from '../../services/EmailServices.js'

//#create Order Return Request
export const createReturnOrder = async (req, res) => {
    const { reason } = req.body
    const { id } = req.query
    const multipleFiles = req.files?.['image']
        ? req.files['image'].map((e) => ({ file: e.filename }))
        : []

    try {
        const returnId = await generateReturnId()
        const checkOrderReturnStatus = await ReturnOrder.findOne({
            orderId: id,
        })

        if (checkOrderReturnStatus) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ALREADY_REQUESTED_RETURNED,
            })
        }

        const order = await Order.findOne({
            _id: id,
            status: 'Delivered',
            isOrderReturn: false,
        }).populate({
            path: 'userId expertId',
            select: 'name email',
        })

        if (!order) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ORDER_NOT_FOUND,
            })
        }

        const currentTime = Date.now()
        const deliveryTime = order.deliveryDateTime
        const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000

        if (currentTime > deliveryTime + sevenDaysInMillis) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.RETURN_PERIOD_EXPIRE,
            })
        }

        const returnOrder = new ReturnOrder({
            orderId: id,
            bookingId: order.bookingId,
            expertId: order.expertId,
            userId: req.user,
            reason,
            imageByUser: multipleFiles,
            returnOrderId: returnId,
        })

        const myOrder = await Order.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    orderReturnStatus: returnOrder.status,
                    isOrderReturn: true,
                },
            },
            { new: true }
        )
        const myOrderdata = await Order.findOne(
            { _id: id }
        ).populate('userId')

        let myuseremail = myOrderdata.userId.email
        let myorderId = myOrderdata.orderId

        await orderReturnEmail(myuseremail, myorderId)

        await myOrder.save()
        await returnOrder.save()

        return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.ORDER_RETURNED_REQUESTED,
            data: returnOrder,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#update Order Return Request 
export const updateReturnOrderStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        let returnOrder = await ReturnOrder.findByIdAndUpdate(
            { _id: id },
            { $set: { status } },
            { new: true }
        )

        if (!returnOrder) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: 'Return order not found',
            })
        }

        // If the status is "Accepted", assign an available expert
        if (status === 'accepted') {
            const expert = await Expert.findOne({ isAvailable: true })

            if (expert) {
              
                returnOrder.expertId = expert._id
                returnOrder.assignedExpert = expert._id
                returnOrder.expertAssignmentStatus = 'Assigned'

                await Order.findByIdAndUpdate(
                    { _id: returnOrder.orderId },
                    {
                        expertAssignmentStatus:
                            returnOrder.expertAssignmentStatus,
                        assignedExpertForReturn: returnOrder.assignedExpert,
                    },
                    { new: true }
                )
              const myorder =  await Order.findOne(
                    { _id: returnOrder.orderId },
                ).populate('assignedExpertForReturn')

                let myorderId = myorder.orderId
                let myexpertId = myorder.assignedExpertForReturn
                    ? myorder.assignedExpertForReturn.email
                    : null
    
                    if(myexpertId){
                        await orderReturnNotifyExpertEmail(myorderId, myexpertId)
                    }
                await returnOrder.save()
            } else {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message:
                        'Return order accepted, but no available expert found',
                    data: returnOrder,
                })
            }
        }

        let myreturnOrder = await ReturnOrder.findOne(
            { _id: id }
        ).populate('userId').populate('orderId')
        const myuseremail = myreturnOrder.userId.email
        const myorderId = myreturnOrder.orderId.orderId
        await orderReturnStatusUpdateEmail(myuseremail, myorderId, status)

        await Order.findByIdAndUpdate(
            { _id: returnOrder.orderId },
            {
                orderRefund: 'Pending',
                orderReturnStatus: returnOrder.status,
            },
            { new: true }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ORDER_RETURN_REQUEST_UPDATE,
            data: returnOrder,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#reassign expert
export const reassignExpert = async (req, res) => {
    const { id, expertId } = req.query

    try {
        const returnOrder = await ReturnOrder.findOne({ _id: id })
        if (!returnOrder) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.RETURN_REQUEST_NOT_FOUND,
            })
        }

        if (returnOrder.status !== 'accepted') {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.RETURN_REQUEST_NOT_ACCEPTED,
            })
        }
        if (returnOrder.expertReview == true) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.RETURN_NOT_ACCEPT_NOT_ASSIGN_EXPERT,
            })
        }

        const newExpert = await Expert.findOne({
            _id: expertId,
            isAvailable: true,
        })

        if (!newExpert) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: 'No other available expert found',
            })
        }
        returnOrder.assignedExpert = newExpert._id
        returnOrder.expertAssignmentStatus = 'Reassigned'
        await returnOrder.save()

        const returnOrderEmail = await ReturnOrder.findOne({ _id: id }).populate('orderId').populate('assignedExpert')
        const myorderId = returnOrderEmail.orderId.orderId
        const myexpertId = returnOrderEmail.assignedExpert
            ? returnOrderEmail.assignedExpert.email
            : null
        await orderReturnNotifyExpertEmail(myorderId, myexpertId)

        await Order.findOneAndUpdate(
            { _id: returnOrder.orderId },
            {
                expertAssignmentStatus: returnOrder.expertAssignmentStatus,
                assignedExpertForReturn: returnOrder.assignedExpert,
            },
            { new: true }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: 'Return order reassigned to a new expert',
            data: returnOrder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#get all return order
export const getAllReturnOrder = async (req, res) => {
    try {
        const returnOrder = await ReturnOrder.find()
            .populate({ path: 'orderId', select: 'orderId' })
            .populate({
                path: 'bookingId',
                select: 'ServicesAndProducts',
                populate: {
                    path: 'ServicesAndProducts.ServicesProductId',
                    select: 'name productImage description',
                },
            })
            .populate({
                path: 'assignedExpert userId',
                select: 'name email phoneNumber',
            })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.RETURN_REQUEST_ALL,
            data: returnOrder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//# get return order by Id
export const getReturnOrderById = async (req, res) => {
    try {
        const returnOrder = await ReturnOrder.findOne({ _id: req.query.id })
            .populate({ path: 'orderId', select: 'orderId' })
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'ServicesAndProducts.ServicesProductId',
                    select: 'name productImage description',
                },
            })
            .populate({ path: 'assignedExpert userId', select: 'name email' })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.RETURN_REQUEST_ALL,
            data: returnOrder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//# get return order by expert
export const getAssignReturnOrder = async (req, res) => {
    try {
        const expertId = req.expert

        const returnOrder = await ReturnOrder.find({
            assignedExpert: expertId,
        })
            .populate('orderId')
            .populate('userId')
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'ServicesAndProducts.ServicesProductId',
                    select: 'name productImage description',
                },
            })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.RETURN_REQUEST_ALL,
            data: returnOrder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//# add review details for return order by expert
export const ReturnOrderupdateByExpert = async (req, res) => {
    const { reviewDetails } = req.body
    const expertId = req.expert
    // const id = req.query.id
    const multipleFiles = req.files['image']
        ? req.files['image'].map((e) => ({ file: e.filename }))
        : []

    try {
        const returnOrder = await ReturnOrder.findOneAndUpdate(
            { _id: req.query.id, assignedExpert: expertId },

            {
                reviewDetails,
                imageByExpert: multipleFiles,
                expertReview: true,
            },
            { new: true }
        )

        const returnOrderEmail = await ReturnOrder.findOne(
            { _id: req.query.id, assignedExpert: expertId }).populate('orderId').populate('assignedExpert')
        const myorderId = returnOrderEmail.orderId.orderId
        const returnRequestId = returnOrderEmail.returnOrderId
        const myexpertId = returnOrderEmail.assignedExpert
            ? returnOrderEmail.assignedExpert.email
            : null
        const expertName = returnOrderEmail.assignedExpert
            ? returnOrderEmail.assignedExpert.name
            : null
        await orderReturnStatusUpdateByExpertEmail(
            expertName,
            myorderId,
            myexpertId,
            returnRequestId
        )

        return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.ORDER_REVIEW_COMPLATE,
            data: returnOrder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(error)
    }
}
//#endregion

//# return order reject or approve with refund mail by admin
export const orderRefundApproveRejectByAdmin = async (req, res) => {
    try {
        const { status } = req.body
        let refundId = await generateRefundId()
        const returnOrder = await ReturnOrder.findById({
            _id: req.query.id,
        }).populate({
            path: 'orderId',
            select: 'quotationTotalAmount',
        })

        if (!returnOrder || !returnOrder.expertReview) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.EXPERT_ORDER_REVIEW_NOT_FOUND,
            })
        }

        const returnOrderEmail = await ReturnOrder.findById({
            _id: req.query.id,
        }).populate('userId').populate('orderId')
        returnOrderEmail.status = status
        const myuseremail = returnOrderEmail.userId.email
        const myorderId = returnOrderEmail.orderId.orderId

        await orderReturnRefundStatusUpdateEmail(myuseremail, myorderId, status)
        returnOrder.status = status
        await returnOrder.save()

        await Order.findByIdAndUpdate(
            { _id: returnOrder.orderId._id },
            {
                orderReturnStatus: returnOrder.status,
            }
        )
        await Booking.findByIdAndUpdate(
            { _id: returnOrder.bookingId },
            {
                orderReturnStatus: returnOrder.status,
            }
        )

        if (status == 'approved') {
            const refund = {
                refundId: refundId,
                bookingId: returnOrder.bookingId,
                orderId: returnOrder.orderId._id,
                userId: returnOrder.userId,
                expertId: returnOrder.expertId,
                refundAmount: returnOrder.orderId.quotationTotalAmount,
                orderStatus: returnOrder.status,
            }
            await Refund.create(refund)
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message:
                returnOrder.status == 'approved'
                    ? ResponseMessage.ORDER_RETURN_REQUEST_APPROVED
                    : ResponseMessage.ORDER_RETURN_REQUEST_NOT_APPROVED,
            data: returnOrder,
        })
    } catch (error) {
        console.error(error)
        return handleErrorResponse(error)
    }
}
//#endregion
