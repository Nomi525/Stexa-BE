import StatusCodes from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'

import Partner from '../../models/partner.js'
import { handleErrorResponse } from '../../services/CommonService.js'
import {
    emailPartnerUs,
    emailPartnerUsUpdate,
} from '../../services/EmailServices.js'

export const applyPartner = async (req, res) => {
    try {
        await emailPartnerUs(req.body.email)
        let partnerData = {}
        if (req.body.type === 'Fashion designer') {
            partnerData = {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                address: req.body.address,
                qualification: req.body.qualification,
                descirption: req.body.descirption,
                type: req.body.type,
            }
        } else if (req.body.type === 'Boutique') {
            partnerData = {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                address: req.body.address,
                descirption: req.body.descirption,
                business_Registration_details:
                    req.body.business_Registration_details,
                gst_number: req.body.gst_number,
                business_address: req.body.business_address,
                type: req.body.type,
            }
        }

        const partner = await Partner.create(partnerData)

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PARTNER_APPLIED_SUCCESSFULLY,
            data: partner,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const approveAndRejectPartner = async (req, res) => {
    try {
        const { id, status, rejectReason } = req.body
        const partner = await Partner.findOne({ _id: id })

        let newActiveStatus = partner.isApproved // Default to current value
        let message = ''

        if (status === 'Approved') {
            newActiveStatus = true
            message = ResponseMessage.PARTNER_APPROVED
        } else if (status === 'Rejected') {
            newActiveStatus = false
            message = ResponseMessage.PARTNER_REJECTED
        }

        const partnerStatusUpdate = await Partner.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    isApproved: newActiveStatus,
                    rejectReason: rejectReason,
                },
            },
            { new: true }
        )

        await emailPartnerUsUpdate(partner.email, status, rejectReason)

        return res.status(200).json({
            status: StatusCodes.OK,
            message: message,
            data: partnerStatusUpdate,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const getAllPartners = async (req, res) => {
    try {
        const data = await Partner.find({
            isDeleted: false,
        })
            .select(
                'name email phoneNumber address type qualification description status isApproved'
            )
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.All_PARTNER,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getSinglePartner = async (req, res) => {
    try {
        const { id } = req.query

        const data = await Partner.findById({
            _id: id,
            isDeleted: false,
            isApproved: true,
        }).select(
            'name email phoneNumber address qualification description status'
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.PARTNER_DETAILS_FATCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
