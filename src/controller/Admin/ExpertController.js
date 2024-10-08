import StatusCodes from 'http-status-codes'
import Expert from '../../models/Expert.js'
import {
    getAvailableExperts,
    handleErrorResponse,
} from '../../services/CommonService.js'
import { ResponseMessage } from '../../utils/ResponseMessage.js'

import { sendVerificationEmailOTP } from '../../services/EmailServices.js'
import { createExpertCsv } from '../../utils/CsvFile.js'
import User from '../../models/User.js'
//import Booking from '../../models/Booking.js'
export const addEditExpert = async (req, res) => {
    try {
        const {
            // id,
            name,
            specialization,
            grade,
            phoneNumber,
            roleId,
            date,
            endTime,
            startTime,
            qulification,
            experience,
            type,
            adminRating,
            expertCharges,
            adminReview,
            address,
            city,
            country,
            state,
            consultationCharges,
            latitude,
            longitude,
            zipCode,
        } = req.body

        const id = req.expert ? req.expert : req.body.id
        let email = req.body.email.toLowerCase()
        const singleFile = req.files['image']
            ? req.files['image'][0].filename
            : null

        const multipleFiles = req.files['design']
            ? req.files['design'].map((e) => ({ file: e.filename }))
            : []

        if (singleFile !== null && singleFile !== '') {
            singleFile
        }
        if (multipleFiles !== null && multipleFiles !== '') {
            multipleFiles
        }

        const existingExpert = id ? await Expert.findById({ _id: id }) : null

        if (existingExpert) {
            if (email && existingExpert.email !== email) {
                const emailExistsInExpert = await Expert.exists({ email })
                const emailExistsInUser = await User.exists({ email })
                if (emailExistsInExpert || emailExistsInUser) {
                    return res.status(409).json({
                        status: StatusCodes.CONFLICT,
                        message: ResponseMessage.USER_EMAIL_ALREADY_REGISTERED,
                    })
                }
            }

            if (phoneNumber && existingExpert.phoneNumber !== phoneNumber) {
                const phoneExistsInExper = await Expert.exists({ phoneNumber })
                const phoneExistsInUser = await User.exists({ phoneNumber })
                if (phoneExistsInExper || phoneExistsInUser) {
                    return res.status(409).json({
                        status: StatusCodes.CONFLICT,
                        message: ResponseMessage.PHONE_NO_ALREADY_REGISTERED,
                    })
                }
            }

            if (
                (email && existingExpert.email !== email) ||
                (phoneNumber && existingExpert.phoneNumber !== phoneNumber)
            ) {
                const otp = 4444
                const otpExpiryTime = new Date(Date.now() + 33 * 1000).getTime()

                const expertOTP = await Expert.findByIdAndUpdate(
                    id,
                    {
                        $set: {
                            otp,
                            otpExpire: otpExpiryTime,
                            image:
                                singleFile !== null &&
                                singleFile !== '' &&
                                singleFile.length > 0
                                    ? singleFile
                                    : existingExpert.image,
                            designImage:
                                multipleFiles !== null &&
                                multipleFiles !== '' &&
                                multipleFiles.length > 0
                                    ? multipleFiles
                                    : existingExpert.designImage,
                        },
                    },
                    { new: true }
                )

                await sendVerificationEmailOTP(existingExpert.email, otp)

                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.OTP_SENT,
                    data: {
                        id: expertOTP._id,
                        name,
                        email,
                        phoneNumber,
                        specialization:
                            specialization && specialization.split(','),
                        grade,
                        qulifications: qulification, //&& qulification.split(',')
                        experience,
                        roleId,
                        date,
                        consultationCharges,
                        type,
                        endTime: endTime && endTime.split(','),
                        startTime: startTime && startTime.split(','),
                        address,
                        city,
                        country,
                        longitude,
                        latitude,
                        state,
                        zipCode,
                    },
                    isVerified: false,
                    verifiedField:
                        existingExpert.email !== email
                            ? 'email'
                            : existingExpert.phoneNumber !== phoneNumber
                              ? 'phoneNumber'
                              : null,
                })
            } else {
                const update = await Expert.findByIdAndUpdate(
                    id,
                    {
                        $set: {
                            specialization:
                                specialization && specialization.split(','),
                            qulifications: qulification, // && qulification.split(','),
                            experience,
                            address,
                            city,
                            country,
                            state,
                            expertCharges,
                            consultationCharges,
                            zipCode,
                            image:
                                singleFile !== null &&
                                singleFile !== '' &&
                                singleFile.length > 0
                                    ? singleFile
                                    : existingExpert.image,
                            designImage:
                                multipleFiles !== null &&
                                multipleFiles !== '' &&
                                multipleFiles.length > 0
                                    ? multipleFiles
                                    : existingExpert.designImage,
                            name,
                            email,
                            type,
                            endTime: endTime && endTime.split(','),
                            startTime: startTime && startTime.split(','),
                            grade,
                            phoneNumber,
                            latitude,
                            longitude,
                            adminRating,
                            adminReview,
                            date,
                        },
                    },
                    { new: true }
                )
                if (update) {
                    return res.status(StatusCodes.OK).json({
                        status: StatusCodes.OK,
                        message: ResponseMessage.EXPERT_UPDATED,
                        data: update,
                    })
                }
            }
        } else {
            let existingUser = await User.findOne({
                $or: [{ email }, { phoneNumber }],
                isDeleted: false,
            })

            if (!existingUser) {
                existingUser = await Expert.findOne({
                    $or: [{ email }, { phoneNumber }],
                    isDeleted: false,
                })
            }

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(409).json({
                        status: StatusCodes.CONFLICT,
                        message: ResponseMessage.USER_EMAIL_ALREADY_REGISTERED,
                    })
                } else {
                    return res.status(409).json({
                        status: StatusCodes.CONFLICT,
                        message: ResponseMessage.PHONE_NO_ALREADY_REGISTERED,
                    })
                }
            }

            const newExpert = new Expert({
                name,
                email,
                phoneNumber,
                specialization: specialization && specialization.split(','),
                grade,
                image: singleFile,
                designImage: multipleFiles,
                qulifications: qulification, // && qulification.split(','),
                experience,
                roleId,
                expertCharges,
                date,
                type,
                endTime: endTime && endTime.split(','),
                startTime: startTime && startTime.split(','),
                address,
                city,
                country,
                consultationCharges,
                adminRating,
                adminReview,
                longitude,
                latitude,
                state,
                zipCode,
            })

            await newExpert.save()
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.EXPERT_CREATED,
                data: newExpert,
            })
        }
    } catch (error) {
        console.error(error)
        return handleErrorResponse(res, error)
    }
}

//#region removeExpert
export const removeExpert = async (req, res) => {
    try {
        let { id } = req.query
        let removeExpert = await Expert.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )
        if (!removeExpert) {
            return res.status(400).json({
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.EXPERT_REMOVED,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region getAllExperts

export const getAllExperts = async (req, res) => {
    try {
        const page = Math.max(0, Number(req.query.page)) || 0
        const perPage = Number(req.query.perPage) || ''

        let data

        const filtersApplied =
            req.query.specializations ||
            req.query.isAvailable !== undefined ||
            req.query.distance ||
            req.query.availability

        if (filtersApplied) {
            data = await getAvailableExperts(req)
        } else {
            data = await Expert.find({ isActive: true, isDeleted: false })
                .sort({
                    createdAt: -1,
                })
                .skip((page - 1) * perPage)
                .limit(perPage)
        }
        const totalCount = await Expert.countDocuments({
            isActive: true,
            isDeleted: false,
        })
        const count = data.length
        return res.status(200).json({
            message: ResponseMessage.ALL_EXPERT,
            data,
            pagination: {
                page,
                perPage,
                count,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            },
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getAllExpertsAd = async (req, res) => {
    try {
        const page = Math.max(0, Number(req.query.page) - 1) || 0
        const perPage = Number(req.query.perPage) || ''

        let data

        const filtersApplied =
            req.query.specializations ||
            req.query.isAvailable !== undefined ||
            req.query.distance ||
            req.query.availability

        if (filtersApplied) {
            data = await getAvailableExperts(req)
        } else {
            data = await Expert.find({ isDeleted: false }).sort({
                createdAt: -1,
            })
        }

        const count = data.length
        return res.status(200).json({
            message: ResponseMessage.ALL_EXPERT,
            data,
            pagination: {
                page,
                perPage,
                count,
            },
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getAllExpertsList = async (req, res) => {
    try {
        const data = await Expert.find({
            isActive: true,
            isDeleted: false,
        })
            .select('name')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: 'Experts with matching specialization found',
            data,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
export const getAllExpertsListByServiceId = async (req, res) => {
    try {
        const data = await Expert.find({
            serviceId: req.query.id,
            isActive: true,
            isDeleted: false,
        })
            .select('name')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: 'Experts with matching specialization found',
            data,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getSingleExpert = async (req, res) => {
    try {
        const { id } = req.query
        const data = await Expert.findById({ _id: id }).select(
            '-password -otp -otpExpire -token'
        )
        return res.status(200).json({
            message: ResponseMessage.EXPERT_DETAILS,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region toggleExpertActiveStatus
export const expertActiveDeactiveStatus = async (req, res) => {
    try {
        const expert = await Expert.findOne({ _id: req.body.id })

        if (!expert) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.EXPERT_NOT_FOUND,
            })
        } else {
            // Toggle active status
            const newActiveStatus = !expert.isActive

            const updatedBanner = await Expert.updateOne(
                { _id: req.body.id },
                { $set: { isActive: newActiveStatus } },
                { new: true }
            )

            return res.status(200).json({
                status: StatusCodes.OK,
                message: !newActiveStatus
                    ? ResponseMessage.EXPERT_DEACTIVE
                    : ResponseMessage.EXPERT_ACTIVE,
                data: updatedBanner,
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
        })
    }
}

export const expertListingsToCSVExport = async (req, res) => {
    try {
        const expertData = await Expert.find({})
            .select('-password')

            .sort({ createdAt: -1 })

        let result = await createExpertCsv(expertData)

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${'expert_listings.csv'}`
        )
        res.send(result)
    } catch (error) {
        console.error('Error exporting job listings to CSV:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

//#function that check and update according availability of expert

// const updateExpertAvailabilityStatus = async () => {
//     try {
//         const now = moment()
//         const query = {
//             startTime: { $gte: now.toDate() },
//             endTime: { $lte: now.toDate() },
//
//         }
//         await Expert.updateMany(query, {
//             $set: { isAvailable:  },
//         })
//     } catch (error) {
//         console.error('Error updating expert data', error)
//     }
// }
