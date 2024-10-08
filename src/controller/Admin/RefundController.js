import Refund from '../../models/Refund.js'
import StatusCodes from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
import { handleErrorResponse } from '../../services/CommonService.js'
import { createRefundCsv } from '../../utils/CsvFile.js'

export const getAllRefund = async (req, res) => {
    try {
        const refund = await Refund.find({ isDeleted: false })
            .populate('bookingId')
            .populate({ path: 'userId expertId', select: 'name email' })
            .sort({ createdAt: -1 })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REFUND_FOUND,
            data: refund,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getSingleRefund = async (req, res) => {
    try {
        const { id } = req.query
        const refund = await Refund.findOne({ _id: id })
            .populate('bookingId')
            .populate({ path: 'userId expertId', select: 'name email' })
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REFUND_FOUND,
            data: refund,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const removeRefund = async (req, res) => {
    try {
        const { id } = req.query
        const refund = await Refund.findOne({ _id: id })
        refund.isDeleted = true
        await refund.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REFUND_DELETED,
            data: refund,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
export const approveRejectRefund = async (req, res) => {
    try {
        const { id, status } = req.query
        const refund = await Refund.findOne({ _id: id })
        refund.status = status
        await refund.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REFUND_APPROVED_REJECTED,
            data: refund,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const refundListingsToCSVExport = async (req, res) => {
    try {
        const refundData = await Refund.find({ isDeleted: false })
            .populate({ path: 'bookingId', select: 'bookingId ' })
            .populate({ path: 'orderId', select: 'orderId ' })
            .populate({ path: 'userId expertId', select: 'name email' })
            .sort({ createdAt: -1 })

        let result = await createRefundCsv(refundData)

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${'booking_listings.csv'}`
        )
        res.send(result)
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
