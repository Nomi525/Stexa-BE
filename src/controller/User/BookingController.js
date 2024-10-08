import StatusCodes from 'http-status-codes'
import admin from '../../models/Admin.js'
import Booking from '../../models/Booking.js'
import expert from '../../models/Expert.js'
import User from '../../models/User.js'
import {
    formatDate,
    formatMonth,
    generateBookingId,
    generateRefundId,
    getDatesInRange,
    getMonthsInRange,
    handleErrorResponse,
    // parseQueryParameters,
    // parseQueryParameters,
} from '../../services/CommonService.js'

import {
    bookingAddEmail,
    bookingCancelEmail,
    bookingRefundEmail,
} from '../../services/EmailServices.js'

import { ResponseMessage } from '../../utils/ResponseMessage.js'
import { createBookingCsv } from '../../utils/CsvFile.js'

import ResecheduleBooking from '../../models/Reschedulebooking.js'

import Transaction from '../../models/Transaction.js'
import Refund from '../../models/Refund.js'

// import Notification from '../../models/Notification.js'

// import SendPushNotification from '../../services/SendNotification.js'

// SendPushNotification(
//     'Test notification',
//     'test body',
//     [
//         'fLy016faQGqB3SPGwI_naZ:APA91bE_bPCopRZYu8Npkgqw2EnwMmiSEZGlHd5gRvA_xZTKvlYY1Xz0eleihYaIeciAOi-eO6Fp8_TStv89_iXxoNkAejMDmbFNGAqUV1ud3feRJBoHHxncmR1o93yoq81PixDdJuq6',
//     ],
//     1
// )
//     .then((res) => {
//         console.log(res)
//     })
//     .catch((err) => {
//         console.log(err)
//     })

export const addBooking = async (req, res) => {
    try {
        const userId = req.user
        const userEmail = (await User.findOne({ _id: userId })).email
        const serviceType = 'Fashion Consultant'
        if (!userEmail) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.USER_NOT_FOUND,
                data: [],
            })
        }

        const findExpert = await expert.findOne({ _id: req.body.expertId })

        if (!findExpert) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.EXPERT_NOT_FOUND,
                data: [],
            })
        }

        const newBookingId = await generateBookingId()
        const paymentDetails = [
            {
                paymentId: req.body.paymentId.paymentId,
                paymentStatus: req.body.paymentId.paymentStatus,
                paymentResponse: req.body.paymentId.paymentResponse,
            },
        ]

        const bookingData = {
            bookingId: newBookingId,
            bookingDateTime: req.body.bookingDateTime,
            email: userEmail,
            userId: userId,
            expertId: req.body.expertId,
            serviceType,
            paymentDetails: paymentDetails,
            ...(req.body.type !== 'online' && req.body),
        }

        const transaction = {
            userId,
            bookingId: newBookingId,
            expertId: req.body.expertId,
            fashionConsultantAmount: req.body.amount,
            paymentId: req.body.paymentId,
            paymentStatus: req.body.paymentStatus,
            paymentResponse: req.body.paymentResponse,
            serviceType: serviceType,
        }

        await Transaction.create(transaction)
        const booking = await Booking.create(bookingData)

        //         const title = "Stexa Booking Confirmation";
        //         const description = `Thank you for booking with The Stexa. Your booking ID is ${newBookingId}!`;
        //         const adminId = "660d22825d336c8777ba509b";
        //         const data = {
        //             userId: booking.userId,
        //             expertId: booking.expertId,
        //             adminId: adminId,
        //             notificationType: "User",
        //             title: title,
        //             text: description,
        //             bookingId: booking._id,
        //           };
        //           const userNotificationData = await Notification.create(
        //             data
        //           );

        // userNotification(
        //   userNotificationData._id,
        //   userNotificationData.userId,
        //   userNotificationData.expertId,
        //   userNotificationData.adminId,
        //   booking._id,

        //   title,
        //   description
        // )

        // Send email
        await bookingAddEmail(
            booking.email,
            findExpert.email,
            booking.bookingId
        )
        return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.BOOKING_CREATED,
            data: booking,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const editBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            {
                new: true,
            }
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_UPDATED,
            data: booking,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

// export const bookingReschedule = async (req, res) => {
//     try {
//         // Fetch the booking details
//         const booking = await Booking.findOne({
//             _id: req.body.id,
//             isDeleted: false,
//         })

//         // Check if the booking exists
//         if (!booking) {
//             return res.status(404).json({
//                 status: StatusCodes.NOT_FOUND,
//                 message: ResponseMessage.BOOKING_NOT_FOUND,
//                 data: [],
//             })
//         }

//         // Check if the booking is canceled
//         if (booking.bookingCancel) {
//             return res.status(400).json({
//                 status: StatusCodes.BAD_REQUEST,
//                 message: ResponseMessage.BOOKING_CANT_RESCHEDULE,
//                 data: [],
//             })
//         }

//         const currentTime = Date.now()
//         const bookingTime = new Date(booking.bookingTime).getTime()

//         // Check if the booking time is less than 2 hours from now
//         const twoHoursInMilliseconds = 2 * 60 * 60 * 1000
//         if (bookingTime - currentTime < twoHoursInMilliseconds) {
//             return res.status(400).json({
//                 status: StatusCodes.BAD_REQUEST,
//                 message:
//                     ResponseMessage.BOOKING_CANT_RESCHEDULE_LESS_THAN_2_HOURS,
//                 data: [],
//             })
//         }

//         const rescheduleBooking = {
//             ...req.body,
//         }

//         // Update the booking details
//         const updatedBooking = await Booking.findOneAndUpdate(
//             { _id: req.body.id, isDeleted: false, bookingCancel: false },
//             rescheduleBooking,
//             { new: true }
//         )

//         // Check if the booking was successfully updated
//         if (updatedBooking) {
//             return res.status(200).json({
//                 status: StatusCodes.OK,
//                 message: ResponseMessage.BOOKING_RESCHEDULE,
//                 data: updatedBooking,
//             })
//         }

//         // If booking was not found or updated, return not found response
//         return res.status(404).json({
//             status: StatusCodes.NOT_FOUND,
//             message: ResponseMessage.BOOKING_NOT_FOUND,
//             data: [],
//         })
//     } catch (error) {
//         console.log(error)
//         return handleErrorResponse(res, error)
//     }
// }

export const bookingCancel = async (req, res) => {
    try {
        let bookingCanceledBy = req.user || req.expert || req.admin
        let referModel = ''
        let refundId = await generateRefundId()
        if (bookingCanceledBy) {
            const models = [User, expert, admin]

            for (const Model of models) {
                let entity = await Model.findOne({ _id: bookingCanceledBy })

                if (entity) {
                    referModel = Model.modelName
                    bookingCanceledBy = entity._id
                    break
                }
            }
        }

        const { id, status } = req.query
        const bookingRefund = 'Pending'
        // const { status } = req.body
        const booking = await Booking.findOne({
            _id: id,
            isDeleted: false,
        }).populate({ path: 'userId expertId', select: 'email' })

        const currentTime = Date.now()
        const bookingTime = booking.bookingDateTime
        const hoursDifference = (bookingTime - currentTime) / (1000 * 60 * 60)
        if (hoursDifference < 4) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BOOKING_NOT_CANCEL,
            })
        }

        let bookingId = booking.bookingId
        if (booking) {
            const bookingCancel = await Booking.findOneAndUpdate(
                {
                    _id: id,
                },
                {
                    bookingCancel: true,
                    status: status,
                    bookingCanceledBy: bookingCanceledBy,
                    isApproved: false,
                    referModel: referModel,
                    bookingRefund,
                },
                { new: true }
            )

            const refund = {
                refundId: refundId,
                bookingId: bookingCancel._id,
                // orderId: bookingCancel.orderId,
                userId: bookingCancel.userId,
                expertId: bookingCancel.expertId,
                refundAmount: bookingCancel.amount,
                bookingStatus: bookingCancel.status,
            }
            await Refund.create(refund)
            let referModelData = referModel

            await bookingCancelEmail(
                booking.email,
                booking.expertId.email,
                bookingId,
                status,
                referModelData
            )

            const canceldata = await bookingRefundEmail(
                booking.email,
                booking.expertId.email,
                bookingId,
                refund.bookingStatus,
                referModelData
            )
            console.log(canceldata, canceldata)
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.BOOKING_CANCELLED,
                data: bookingCancel,
            })
        }

        return res.status(404).json({
            status: StatusCodes.NOT_FOUND,
            message: ResponseMessage.BOOKING_NOT_FOUND,
            data: [],
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getAllBookings = async (req, res) => {
    try {
        const data = await Booking.find({ isDeleted: false })
            .populate({ path: 'expertId', select: 'name' })
            .populate({ path: 'userId', select: 'name' })
            .sort({ createdAt: -1 })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts.ServicesProductId',
                populate: {
                    path: 'serviceId superCategoryId categoryId subCategoryId',
                    select: 'name',
                },
            })

        return res.status(200).json({
            message: ResponseMessage.ALL_BOOKINGS,
            data,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getSingleBooking = async ({ query: { id } }, res) => {
    try {
        const booking = await Booking.findById(id)
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts.ServicesProductId',
                populate: {
                    path: 'serviceId superCategoryId categoryId subCategoryId',
                    select: 'name',
                },
            })
            .populate([
                {
                    path: 'expertId userId',
                    select: 'name phoneNumber email image address city country state zipCode',
                },
            ])
            .where({
                isDeleted: false,
            })

        if (!booking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.BOOKING_NOT_FOUND,
            })
        }

        return res.status(200).json({
            message: ResponseMessage.BOOKING_FOUND,
            data: booking,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

// export const getAllBookingExpert = async (req, res) => {
//     try {
//         const booking = await parseQueryParameters(
//             req,
//             Booking,
//             '',
//             [
//                 {
//                     path: 'expertId',
//                     select: 'name',
//                 },
//                 {
//                     path: 'userId',
//                     select: 'name',
//                 },
//                 {
//                     path: 'ServicesAndProducts.ServicesProductId',
//                     select: 'name productImage description',
//                 },

//                 {
//                     path: 'products.productId',
//                     select: 'name image description',
//                 },
//             ],
//             { expertId: req.expert, serviceType: req.query.serviceType }
//         )

//         if (booking) {
//             return res.status(200).json({
//                 status: StatusCodes.OK,
//                 message: ResponseMessage.BOOKING_FOUND,
//                 data: booking,
//             })
//         }

//         return res.status(404).json({
//             status: StatusCodes.NOT_FOUND,
//             message: ResponseMessage.BOOKING_NOT_FOUND,
//         })
//     } catch (error) {
//         return handleErrorResponse(res, error)
//     }
// }

export const getAllBookingExpert = async (req, res) => {
    try {
        const page = Math.max(0, Number(req.query.page) - 1) || 0
        const perPage = Number(req.query.perPage) || ''
        const { serviceType, bookingType } = req.query
        const dateRange = Number(req.query.dateRange)
        const expertId = req.expert

        let query = {
            expertId: expertId,
            isDeleted: false,
            status: 'approve',
        }

        if (serviceType) {
            query.serviceType = serviceType
        }

        if (bookingType) {
            query.bookingType = bookingType
        }

        // if (dateRange) {
        //     const currentDate = new Date()

        //     currentDate.setHours(0, 0, 0, 0)
        //     const endDate = new Date()

        //     endDate.setDate(currentDate.getDate() - dateRange)

        //     endDate.setHours(23, 59, 59, 999)

        //     const currentDateTimestamp = currentDate.getTime()
        //     const endDateTimestamp = endDate.getTime()

        //     query.bookingDateTime = {

        //         $gte: currentDateTimestamp,
        //         $lte: endDateTimestamp,
        //     }
        // }
        if (dateRange) {
            const currentDate = new Date()

            currentDate.setHours(23, 59, 59, 999)

            const endDate = new Date()

            endDate.setDate(currentDate.getDate() - (dateRange - 1))
            endDate.setHours(0, 0, 0, 0)

            const currentDateTimestamp = currentDate.getTime()
            const endDateTimestamp = endDate.getTime()

            query.bookingDateTime = {
                $gte: endDateTimestamp,
                $lte: currentDateTimestamp,
            }
        }

        const data = await Booking.find(query)
            .sort({ createdAt: -1 })
            .skip(page * perPage)
            .limit(perPage)
            .populate({
                path: 'expertId userId',
                select: 'name image',
            })
            .populate({
                path: 'ServicesAndProducts.ServicesProductId',
                select: 'name productImage description',
            })
            .populate({
                path: 'products.productId',
                select: 'name image description',
            })

        const bookingdate = data.map((item) => {
            return item.bookingDateTime
        })
        console.log(bookingdate)
        const count = await Booking.countDocuments(query)

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_FOUND,
            data: { data, count, page, perPage },
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}

export const getCurrentAndPastBooking = async (req, res) => {
    try {
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        const currentDateTimestamp = currentDate.getTime()
        const bookings = await Booking.find({ userId: req.user })
            .sort({ createdAt: -1 })
            .select(
                'bookingDateTime bookingId orderId bookingCancel bookingType serviceType status'
            )
            .populate({
                path: 'expertId',
                select: 'name email phoneNumber image',
            })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts',
                populate: {
                    path: 'ServicesProductId',
                    model: 'ServicesProductList',
                },
            })

        let bookeingDetails = []

        if (req.query.type === 'currentBookings') {
            bookeingDetails = bookings.filter((booking) => {
                const bookingDate = new Date(booking.bookingDateTime)

                return (
                    bookingDate >= new Date(currentDateTimestamp)
                    // && booking.status === 'approve'
                )
            })
        }

        if (req.query.type === 'pastBookings') {
            bookeingDetails = bookings.filter((booking) => {
                const bookingDate = new Date(booking.bookingDateTime)

                return (
                    bookingDate < new Date(currentDateTimestamp) &&
                    booking.status === 'approve'
                )
            })
        }

        res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_FOUND,
            data: bookeingDetails,
        })
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return handleErrorResponse(res, error)
    }
}
export const getJobCardBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user,
            serviceType: 'Stitching',
        })
            .sort({ createdAt: -1 })
            .select(
                'bookingDateTime bookingId orderId bookingCancel bookingType measurements serviceType status'
            )
            .populate({
                path: 'expertId',
                select: 'name email phoneNumber image address city country state zipCode',
            })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts',
                populate: {
                    path: 'ServicesProductId',
                    model: 'ServicesProductList',
                },
            })

        res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_FOUND,
            data: bookings,
        })
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return handleErrorResponse(res, error)
    }
}

// export const getRecentAndPastBookingExpertList = async (req, res) => {
//     try {
//         const currentDate = new Date()
//         currentDate.setHours(0, 0, 0, 0)

//         // const currentDateTimestamp = currentDate.getTime()
//         const bookings = await Booking.find({ userId: req.user })

//             .select({
//                 bookingDateTime: 1,
//                 bookingId: 1,
//                 serviceType: 1,
//                 status: 1,
//                 orderStatus: 1,
//                 image: 1,
//             })
//             .populate({
//                 path: 'expertId',
//                 select: 'name email phoneNumber image',
//             })
//             .sort({ createdAt: -1 })

//         let bookeingDetails = []

//         if (req.query.type === 'RecentBookingsExpert') {
//             // bookeingDetails = bookings
//             bookeingDetails = bookings.filter((booking) => {
//                 const bookingDate = new Date(booking.bookingDateTime)
//                 return bookingDate >= new Date(currentDate)
//             })
//         }

//         // if (req.query.type === 'pastBookingsExpert') {
//         //     bookeingDetails = bookings.filter((booking) => {
//         //         const bookingDate = new Date(booking.bookingDateTime)

//         //         return bookingDate < new Date(currentDateTimestamp)
//         //     })
//         // }

//         if (req.query.type === 'pastBookingsExpert') {
//             // Get the current date

//             const currentDate = new Date()

//             // Calculate the date one month ago
//             const oneMonthAgo = new Date()
//             oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

//             // Filter bookings that occurred within the past month
//             bookeingDetails = bookings.filter((booking) => {
//                 const bookingDate = new Date(booking.bookingDateTime)

//                 return bookingDate > oneMonthAgo && bookingDate < currentDate
//             })
//         }

//         res.status(200).json({
//             status: StatusCodes.OK,
//             message: ResponseMessage.BOOKING_FOUND,
//             data: bookeingDetails,
//         })
//     } catch (error) {
//         console.error('Error fetching bookings:', error)
//         return handleErrorResponse(res, error)
//     }
// }
export const getRecentAndPastBookingExpertList = async (req, res) => {
    try {
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        const bookings = await Booking.find({ userId: req.user })
            .select({
                bookingDateTime: 1,
                bookingId: 1,
                serviceType: 1,
                status: 1,
                orderStatus: 1,
                image: 1,
            })
            .populate({
                path: 'expertId',
                select: 'name email phoneNumber image',
            })
            .sort({ createdAt: -1 })

        let bookingDetails = []

        if (req.query.type === 'RecentBookingsExpert') {
            bookingDetails = bookings.filter((booking) => {
                const bookingDate = new Date(booking.bookingDateTime)
                return bookingDate >= currentDate
            })
        }

        if (req.query.type === 'pastBookingsExpert') {
            // Calculate the date one month ago
            const oneMonthAgo = new Date()
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

            // Filter bookings that are one month or more old
            bookingDetails = bookings.filter((booking) => {
                const bookingDate = new Date(booking.bookingDateTime)
                return bookingDate < oneMonthAgo
            })
        }

        res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_FOUND,
            data: bookingDetails,
        })
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return handleErrorResponse(res, error)
    }
}

export const getUpcomingAndCompletedBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({ expertId: req.expert })
            .sort({ bookingDateTime: 1 })
            .select('-__v -isDeleted -bookingCancel -isApproved -isDeleted')
            .populate({
                path: 'expertId',
                select: 'name email phoneNumber image',
            })
            .populate({
                path: 'userId',
                select: 'name email phoneNumber image',
            })
            .populate('products.productId')
            .populate({
                path: 'ServicesAndProducts',
                populate: {
                    path: 'ServicesProductId',
                    model: 'ServicesProductList',
                },
            })

        let bookingDetails = []

        const currentTimestamp = new Date()
        currentTimestamp.setHours(0, 0, 0, 0)
        console.log(currentTimestamp)
        if (req.query.type === 'upcomingbooking') {
            bookingDetails = bookings.filter((booking) => {
                const bookingDate = new Date(booking.bookingDateTime)
                bookingDate.setHours(0, 0, 0, 0)
                return (
                    bookingDate >= currentTimestamp &&
                    booking.status === 'approve'
                )
            })

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.BOOKING_FOUND,
                data: bookingDetails,
            })
        } else if (req.query.type === 'completedbooking') {
            bookingDetails = bookings.filter((booking) => {
                return (
                    booking.orderStatus === 'Confirmed' &&
                    booking.status === 'approve'
                )
            })

            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.BOOKING_FOUND,
                data: bookingDetails,
            })
        } else {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.BOOKING_NOT_FOUND,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const removeBooking = async (req, res) => {
    try {
        let { id } = req.query
        let removeBooking = await Booking.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    isDeleted: true,
                },
            },
            { new: true }
        )
        if (!removeBooking) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        } else {
            return res.status(200).json({
                status: StatusCodes.OK, // 200
                message: ResponseMessage.BOOKING_REMOVED,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const approveBooking = async (req, res) => {
    //AndCancel
    try {
        const { id, status } = req.body
        const booking = await Booking.findOne({ _id: id })

        const newActiveStatus = !booking.isApproved

        const bookingStatusUpdate = await Booking.findByIdAndUpdate(
            { _id: id },
            { status: status, isApproved: newActiveStatus },
            { new: true }
        )

        return res.status(200).json({
            status: StatusCodes.OK,
            message: newActiveStatus
                ? ResponseMessage.BOOKING_APPROVED
                : ResponseMessage.BOOKING_REJECTED, //!newActiveStatus? ResponseMessage.BOOKING_REJECTED:
            data: bookingStatusUpdate,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const updatebookingexpert = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            {
                new: true,
            }
        )
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_UPDATED,
            data: booking,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const totalEarningsByExpert = async (req, res) => {
    try {
        const { filter } = req.query
        let filterOptions = {}
        let totalEarnings
        let output
        let totalBookingCount
        let startOfWeek
        let endOfWeek
        let startOfMonth
        let endOfMonth
        let startOfYear
        let endOfYear
        let startOfSixMonths
        let endOfSixMonths
        let totalCompletedBookingCount
        let totalCompletedEarnings
        let myoutput

        // if (filter === 'day') {
        //     filterOptions = {
        //         createdAt: {
        //             $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        //             $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        //         },
        //     }
        // } else
        if (filter === 'week') {
            let currentDate = new Date()
            currentDate.setUTCHours(0, 0, 0, 0)

            startOfWeek = new Date(currentDate)
            endOfWeek = new Date(currentDate)

            endOfWeek.setUTCHours(0, 0, 0, 0)
            endOfWeek.setDate(currentDate.getUTCDate() - 6)
            filterOptions = {
                createdAt: {
                    $lte: startOfWeek,
                    $gte: endOfWeek,
                },
            }
        } else if (filter === 'month') {
            let currentDate = new Date()
            currentDate.setUTCHours(23, 59, 59, 999)

            startOfMonth = new Date(currentDate)

            endOfMonth = new Date(currentDate)
            endOfMonth.setUTCHours(0, 0, 0, 0)
            endOfMonth.setMonth(currentDate.getUTCMonth() - 1)
            filterOptions = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                },
            }

            filterOptions = {
                createdAt: {
                    $lte: new Date(startOfMonth),
                    $gte: endOfMonth,
                },
            }
        } else if (filter === 'sixMonth') {
            let currentDate = new Date()
            currentDate.setUTCHours(23, 59, 59, 999)

            startOfSixMonths = new Date(currentDate)
            startOfSixMonths.setMonth(startOfSixMonths.getMonth() - 6) // Subtract 6 months from the current date

            endOfSixMonths = new Date(currentDate)

            filterOptions = {
                createdAt: {
                    $gte: startOfSixMonths,
                    $lte: endOfSixMonths,
                },
            }
        } else if (filter === 'year') {
            let currentDate = new Date()
            currentDate.setUTCHours(23, 59, 59, 999)

            startOfYear = new Date(currentDate)

            endOfYear = new Date(currentDate)
            endOfYear.setUTCFullYear(endOfYear.getUTCFullYear() - 1)
            endOfYear.setUTCHours(0, 0, 0, 0)

            filterOptions = {
                createdAt: {
                    $lte: startOfYear,
                    $gte: endOfYear,
                },
            }
        }
        const bookings = await Booking.find({
            expertId: req.expert,
            bookingCancel: false,
            isDeleted: false,
            status: 'completed',
            ...filterOptions,
        })
        const totalBookings = await Booking.find({
            expertId: req.expert,
            bookingCancel: false,
            isDeleted: false,
            ...filterOptions,
        })

        if (filter == 'week' || filter == 'month') {
            let allDates =
                filter === 'week'
                    ? getDatesInRange(startOfWeek, endOfWeek)
                    : getDatesInRange(startOfMonth, endOfMonth)

            const dateCounts = bookings.reduce((counts, booking) => {
                const date = formatDate(booking.createdAt)
                counts[date] = (counts[date] || 0) + 1
                return counts
            }, {})

            output = Object.entries(dateCounts)
            output = allDates.map((date) => ({
                date,
                count: dateCounts[date] || 0,
            }))

            totalCompletedEarnings = bookings.reduce(
                (total, booking) => total + booking.amount,
                0
            )
            totalCompletedBookingCount = bookings.length

            const dateTotalCounts = totalBookings.reduce((counts, booking) => {
                const date = formatDate(booking.createdAt)
                counts[date] = (counts[date] || 0) + 1
                return counts
            }, {})

            myoutput = Object.entries(dateTotalCounts)
            myoutput = allDates.map((date) => ({
                date,
                count: dateTotalCounts[date] || 0,
            }))

            totalEarnings = totalBookings.reduce(
                (total, booking) => total + booking.amount,
                0
            )
            totalBookingCount = totalBookings.length
        } else if (filter === 'sixMonth' || filter === 'year') {
            let allMonths =
                filter === 'year'
                    ? getMonthsInRange(startOfYear, endOfYear)
                    : getMonthsInRange(startOfSixMonths, endOfSixMonths)

            const monthCounts = bookings.reduce((counts, booking) => {
                const month = formatMonth(booking.createdAt)
                counts[month] = (counts[month] || 0) + 1
                return counts
            }, {})

            output = allMonths
                .map((month) => ({
                    month,
                    count: monthCounts[month] || 0,
                }))
                .sort((a, b) => new Date(a.month) - new Date(b.month))

            totalCompletedBookingCount = bookings.length

            const myMonthCounts = totalBookings.reduce((counts, booking) => {
                const month = formatMonth(booking.createdAt)
                counts[month] = (counts[month] || 0) + 1
                return counts
            }, {})

            myoutput = allMonths
                .map((month) => ({
                    month,
                    count: myMonthCounts[month] || 0,
                }))
                .sort((a, b) => new Date(a.month) - new Date(b.month))

            totalBookingCount = totalBookings.length
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message:
                bookings.length || totalBookings.length
                    ? ResponseMessage.TOTAL_EARNINGS
                    : ResponseMessage.NO_BOOKINGS,
            data: {
                totalCompletedEarnings,
                totalEarnings,
                TotalbookingCompletedDates: output,
                allBookingDates: myoutput,
                totalCompletedBookingCount: totalCompletedBookingCount
                    ? totalCompletedBookingCount
                    : bookings.length,
                totalBookingCount: totalBookingCount
                    ? totalBookingCount
                    : totalBookings.length,
                bookings,
            },
        })
    } catch (error) {
        console.error('Error:', error)
        return handleErrorResponse(res, error)
    }
}
export const totalBookingByExpert = async (req, res) => {
    try {
        const { filter } = req.query
        let filterOptions = {}
        let output
        let totalBookingCount
        let startOfWeek
        let endOfWeek
        let startOfMonth
        let endOfMonth
        let startOfYear
        let endOfYear
        let startOfSixMonths
        let endOfSixMonths

        // if (filter === 'day') {
        //     filterOptions = {
        //         createdAt: {
        //             $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        //             $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        //         },
        //     }
        // } else
        if (filter === 'week') {
            let currentDate = new Date()
            currentDate.setUTCHours(0, 0, 0, 0)

            startOfWeek = new Date(currentDate)

            endOfWeek = new Date(currentDate)

            endOfWeek.setUTCHours(0, 0, 0, 0)
            endOfWeek.setDate(currentDate.getUTCDate() - 6)

            filterOptions = {
                createdAt: {
                    $lte: startOfWeek,
                    $gte: endOfWeek,
                },
            }
        } else if (filter === 'month') {
            let currentDate = new Date()
            currentDate.setUTCHours(23, 59, 59, 999)

            startOfMonth = new Date(currentDate)

            endOfMonth = new Date(currentDate)
            endOfMonth.setUTCHours(0, 0, 0, 0)
            endOfMonth.setMonth(currentDate.getUTCMonth() - 1)
            filterOptions = {
                createdAt: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                },
            }

            filterOptions = {
                createdAt: {
                    $lte: new Date(startOfMonth),
                    $gte: endOfMonth,
                },
            }
        } else if (filter === 'sixMonth') {
            let currentDate = new Date()
            currentDate.setUTCHours(23, 59, 59, 999)

            startOfSixMonths = new Date(currentDate)
            startOfSixMonths.setMonth(startOfSixMonths.getMonth() - 6) // Subtract 6 months from the current date

            endOfSixMonths = new Date(currentDate)

            filterOptions = {
                createdAt: {
                    $gte: startOfSixMonths,
                    $lte: endOfSixMonths,
                },
            }
        } else if (filter === 'year') {
            let currentDate = new Date()
            currentDate.setUTCHours(23, 59, 59, 999)

            startOfYear = new Date(currentDate)

            endOfYear = new Date(currentDate)
            endOfYear.setUTCFullYear(endOfYear.getUTCFullYear() - 1)
            endOfYear.setUTCHours(0, 0, 0, 0)

            filterOptions = {
                createdAt: {
                    $lte: startOfYear,
                    $gte: endOfYear,
                },
            }
        } else if (filter === 'upcoming') {
            let currentDate = new Date()
            currentDate.setUTCHours(0, 0, 0, 0)

            filterOptions = {
                createdAt: {
                    $gte: currentDate,
                },
            }
        }
        const bookings = await Booking.find({
            expertId: req.expert,
            bookingCancel: false,
            isDeleted: false,
            // bookingStatus: filter === 'upcoming' ? 'pending' : 'completed',
            // isApproved: true,
            ...filterOptions,
        })
            .populate('userId')
            .populate('expertId')
            .populate('ServicesAndProducts.ServicesProductId')

        if (filter == 'week' || filter == 'month') {
            let allDates =
                filter === 'week'
                    ? getDatesInRange(startOfWeek, endOfWeek)
                    : getDatesInRange(startOfMonth, endOfMonth)

            const dateCounts = bookings.reduce((counts, booking) => {
                const date = formatDate(booking.createdAt)
                counts[date] = (counts[date] || 0) + 1
                return counts
            }, {})

            output = Object.entries(dateCounts)
            output = allDates.map((date) => ({
                date,
                count: dateCounts[date] || 0,
            }))
        } else if (filter === 'sixMonth' || filter === 'year') {
            let allMonths =
                filter === 'year'
                    ? getMonthsInRange(startOfYear, endOfYear)
                    : getMonthsInRange(startOfSixMonths, endOfSixMonths)
            const monthCounts = bookings.reduce((counts, booking) => {
                const month = formatMonth(booking.createdAt)

                counts[month] = (counts[month] || 0) + 1
                return counts
            }, {})

            output = allMonths
                .map((month) => ({
                    month,
                    count: monthCounts[month] || 0,
                }))
                .sort((a, b) => new Date(a.month) - new Date(b.month))

            totalBookingCount = bookings.length
        }

        return res.status(200).json({
            status: StatusCodes.OK,
            message: bookings
                ? ResponseMessage.EXPERT_BOOKINGS
                : ResponseMessage.NO_BOOKINGS,
            data: {
                data: output,
                totalBookingCount: totalBookingCount
                    ? totalBookingCount
                    : bookings.length,
                bookings,
            },
        })
    } catch (error) {
        console.error('Error:', error)
        return handleErrorResponse(res, error)
    }
}

export const bookingListingsToCSVExport = async (req, res) => {
    try {
        const bookingData = await Booking.find({})
            .select('-password')
            .populate({
                path: 'expertId',
                select: 'name',
            })
            .populate({
                path: 'userId',
                select: 'name',
            })

            .sort({ createdAt: -1 })

        let result = await createBookingCsv(bookingData)

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${'booking_listings.csv'}`
        )
        res.send(result)
    } catch (error) {
        console.error('Error exporting job listings to CSV:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export const bookingReschedule = async (req, res) => {
    try {
        // const userId = req.user
        // const expertId = req.expert

        const { bookingDateTime, id } = req.body
        let requestBy = req.user || req.expert || req.admin
        let referModel = ''

        // Determine who is making the request (user or expert)
        if (requestBy) {
            const models = [User, expert, admin]
            for (const Model of models) {
                let entity = await Model.findOne({ _id: requestBy })
                if (entity) {
                    referModel = Model.modelName
                    requestBy = entity._id
                    break
                }
            }
        }

        // Find the booking
        const findbooking = await Booking.findOne({
            _id: id,
            // $or: [{ userId }, { expertId }],
        })

        if (!findbooking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.BOOKING_NOT_FOUND,
            })
        }

        // Check if reschedule is within 2 hours of the booking time
        // const currentTime = moment();
        // const bookingTime = moment(findbooking.bookingDateTime);
        // const hoursDifference = bookingTime.diff(currentTime, 'hours');
        const currentTime = Date.now()
        const bookingTime = findbooking.bookingDateTime
        const hoursDifference = (bookingTime - currentTime) / (1000 * 60 * 60)

        if (hoursDifference < 2) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BOOKING_NOT_RESEDUAL_NOW,
            })
        }

        // Check if the user has already rescheduled more than 5 times
        const rescheduleCount = await ResecheduleBooking.countDocuments({
            mybookingId: id,
        })

        if (rescheduleCount >= 5) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.NOT_ALLOWED_RESEDUAL_NOW,
            })
        }

        const rescheduleBooking = new ResecheduleBooking({
            userId: findbooking.userId,
            mybookingId: findbooking._id,
            bookingId: findbooking.bookingId,
            rescheduleBookingDateTime: bookingDateTime,
            previousBookingDateTime: findbooking.bookingDateTime,
            expertId: findbooking.expertId,
            requestBy: requestBy,
            referModel: referModel,
        })

        // Save the changes
        await rescheduleBooking.save()

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_RESCHEDULED,
            data: rescheduleBooking,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            error: error.message,
        })
    }
}

export const getMyrescheduleBooking = async (req, res) => {
    const bookingId = req.query.bookingId
    const userId = req.user
    const expertId = req.expert
    // Find the booking
    const findbooking = await ResecheduleBooking.findOne({
        _id: bookingId,
        $or: [{ userId }, { expertId }],
    })
        .populate('mybookingId')
        .populate('requestBy')
        .populate('userId')
        .populate('expertId')

    return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BOOKING_FOUND,
        data: findbooking,
    })
}
//get all by user/expert
export const getMyAllrescheduleBooking = async (req, res) => {
    const userId = req.user
    const expertId = req.expert

    // Find the booking
    const findbooking = await ResecheduleBooking.find(
        { isDeleted: false },
        {
            $or: [{ userId }, { expertId }],
        }
    )
        .populate('mybookingId')
        .populate('requestBy')
        .populate('userId')
        .populate('expertId')

    return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BOOKING_FOUND,
        data: findbooking,
    })
}

//by admin
export const getrescheduleBooking = async (req, res) => {
    const bookingId = req.query.bookingId

    // Find the booking
    const findbooking = await ResecheduleBooking.findOne({
        _id: bookingId,
    })
        .populate('mybookingId')
        .populate('requestBy')
        .populate('userId')
        .populate('expertId')

    return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BOOKING_FOUND,
        data: findbooking,
    })
}

export const getAllrescheduleBooking = async (req, res) => {
    // Find the booking
    const findbooking = await ResecheduleBooking.find({ isDeleted: false })
        .populate('mybookingId')
        .populate('requestBy')
        .populate('userId')
        .populate('expertId')

    return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BOOKING_FOUND,
        data: findbooking,
    })
}

export const approveRejectRescheduleBooking = async (req, res) => {
    try {
        const id = req.query.bookingId

        const { status } = req.body
        const findbooking = await ResecheduleBooking.findOne({
            _id: id,
        })

        if (!findbooking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.REBOOKING_NOT_FOUND,
            })
        }
        findbooking.status = status
        if (status === 'approve') {
            const originalBooking = await Booking.findOneAndUpdate(
                { _id: findbooking.mybookingId },
                {
                    $set: {
                        bookingDateTime: findbooking.rescheduleBookingDateTime,
                    },
                },
                { new: true }
            )
            if (!originalBooking) {
                return res.status(404).json({
                    status: StatusCodes.NOT_FOUND,
                    message: ResponseMessage.BOOKING_NOT_FOUND,
                })
            }

            originalBooking.rescheduleBookingDateTime =
                findbooking.rescheduleBookingDateTime
            await originalBooking.save()

            await findbooking.save()
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.REBOOKING_STATUS_UPDATED,
                data: findbooking,
            })
        }

        // If the status is 'reject', just save the updated status
        await findbooking.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REBOOKING_REJECTED,
            data: findbooking,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            error: error.message,
        })
    }
}

export const deleteBookingReSerequest = async (req, res) => {
    try {
        const bookingId = req.query.bookingId

        const findbooking = await ResecheduleBooking.findOne({ _id: bookingId })

        if (!findbooking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.REBOOKING_NOT_FOUND,
            })
        }

        findbooking.isDeleted = true

        await findbooking.save()
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REBOOKING_DELETED,
            data: findbooking,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            error: error.message,
        })
    }
}

export const editReseduelBooking = async (req, res) => {
    try {
        const bookingId = req.query.bookingId
        const { rescheduleBookingDateTime } = req.body
        const findbooking = await ResecheduleBooking.findOne({ _id: bookingId })
        const booking = await Booking.findOne({
            _id: findbooking.mybookingId,
        })
        if (!findbooking) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.REBOOKING_NOT_FOUND,
            })
        }
        findbooking.rescheduleBookingDateTime = rescheduleBookingDateTime
        // originalBooking.rescheduleBookingDateTime = rescheduleBookingDateTime
        const originalBooking = {
            rescheduleBookingDateTime: rescheduleBookingDateTime,
            bookingDateTime: rescheduleBookingDateTime,
        }
        await findbooking.save()
        await booking.save(originalBooking)
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BOOKING_RESCHEDULEDUP,
            data: findbooking,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            error: error.message,
        })
    }
}
