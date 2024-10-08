import StatusCodes from 'http-status-codes'
import Expert from '../../models/Expert.js'
import ReviewAndRating from '../../models/ReviewAndRating.js'
import {
    handleErrorResponse,
    // parseQueryParameters,
} from '../../services/CommonService.js'
import { ResponseMessage } from '../../utils/ResponseMessage.js'
// import Booking from '../../models/Booking.js'

//#region rating and review
// export const ratingAndReviewExpert = async (req, res) => {
//     try {
//         const { rating, review, expertId } = req.body
//         const userId = req.user

//         await ReviewAndRating.create({
//             rating,
//             review,
//             userId,
//             expertId,
//         })

//         // const ratings = await ReviewAndRating.find({
//         //     expertId: expertId,
//         //     isDeleted: false,
//         // })
//         // const sumOfRatings = ratings.reduce(
//         //     (total, rating) => total + rating.rating,
//         //     0
//         // )

//         // const totalNumberOfRatings = ratings.length
//         // const averageRating = sumOfRatings / totalNumberOfRatings
//         // await Expert.findOneAndUpdate(
//         //     { _id: expertId },
//         //     {
//         //         $set: {
//         //             averageRating: averageRating,
//         //         },
//         //     }
//         // )

//         return res.status(200).send({
//             message: ResponseMessage.RATING_AND_REVIEW_CREATED,
//             data: [],
//         })
//     } catch (err) {
//         return handleErrorResponse(res, err)
//     }
// }
export const ratingAndReviewExpert = async (req, res) => {
    try {
        const { rating, review, expertId, bookingId } = req.body
        const userId = req.user

        const existingReview = await ReviewAndRating.findOne({
            userId,
            expertId,
            bookingId,
        })

        if (existingReview) {
            return res.status(400).send({
                status: StatusCodes.BAD_REQUEST,
                message:
                    ResponseMessage.ALREADY_RATING_AND_REVIEW_FOR_THIS_BOOKING,
            })
        }

        await ReviewAndRating.create({
            rating,
            review,
            userId,
            expertId,
            bookingId,
        })

        return res.status(200).send({
            message: ResponseMessage.RATING_AND_REVIEW_CREATED,
            data: [],
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion
//#region getRatingAndReview

export const getRatingAndReviewExpert = async (req, res) => {
    try {
        const expertId = req.query.id || req.expert
        const perPage = Number(req.query.perPage) || 50
        const page = Math.max(0, Number(req.query.page) - 1) || 0
        const sortKey = req.query.sortKey || 'createdAt'
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1
        const searchQuery = req.query.search
            ? new RegExp(req.query.search.trim().split(' ').join('|'), 'i')
            : ''

        const findDetails = await Expert.findOne({ _id: expertId }).select(
            'name email phoneNumber averageRating specialization image'
        )

        const query = {
            expertId: expertId,

            isDeleted: false,
            isActive: true,
            ratingAndReviewStatus: 'approved',
        }

        if (searchQuery) {
            query.review = searchQuery
        }

        const count = await ReviewAndRating.countDocuments(query)
        const totalPages = Math.ceil(count / perPage)
        const skip = page * perPage

        const sortQuery = { [sortKey]: sortOrder }

        const experts = await ReviewAndRating.find({
            expertId: expertId,
            isDeleted: false,
            isActive: true,
            ratingAndReviewStatus: 'approved',
        })
            .skip(skip)
            .limit(perPage)
            .sort(sortQuery)
            .populate({
                path: 'userId',
                select: 'name email phoneNumber image',
            })

        const groupedData = {}
        experts.forEach((item) => {
            console.log(item)
            const userId = item.userId._id
            groupedData[userId] = groupedData[userId] || {
                ...item.userId.toObject(),
                ratingsAndReviews: [],
            }
            groupedData[userId].ratingsAndReviews.push({
                rating: item.rating,
                review: item.review,
                ratingAndReviewStatus: item.ratingAndReviewStatus,
                isActive: item.isActive,
                isDeleted: item.isDeleted,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                __v: item.__v,
            })
        })

        const transformedData = {
            // expertId: experts.length ? experts[0].expertId : {},
            userId: Object.values(groupedData),
            totalUserReviews: count,
            totalPages: totalPages,
            currentPage: page + 1,
        }

        return res.status(200).send({
            status: StatusCodes.OK,
            message: ResponseMessage.RATING_AND_REVIEW_EXPERT,
            data: { findDetails, transformedData },
        })
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#endregion
//#region getAllRatingAndReview

export const getAllRatingAndReview = async (req, res) => {
    try {
        const data = await ReviewAndRating.find({ isDeleted: false })
            .select(
                'rating review createdAt ratingAndReviewStatus expertId userId'
            )
            .populate({
                path: 'expertId userId',
                select: 'name',
            })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: ResponseMessage.ALL_RATING_AND_REVIEW,
            data,
        })
    } catch (error) {
        console.log(error)
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region approveRejectRatingAndReview

export const approveRejectRatingAndReview = async (req, res) => {
    try {
        const { id, status } = req.body

        const rating = await ReviewAndRating.findOne({
            _id: id,
            isDeleted: false,
        })

        if (!rating) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.RATING_NOT_FOUND,
            })
        }

        const updatedRating = await ReviewAndRating.findOneAndUpdate(
            { _id: id },
            { $set: { ratingAndReviewStatus: status } },
            { new: true }
        )

        const ratings = await ReviewAndRating.find({
            expertId: rating.expertId,
            isDeleted: false,
            ratingAndReviewStatus: 'approved',
        })

        const sumOfRatings = ratings.reduce(
            (total, rating) => total + rating.rating,
            0
        )

        const totalNumberOfRatings = ratings.length
        const averageRating =
            totalNumberOfRatings > 0 ? sumOfRatings / totalNumberOfRatings : 0

        await Expert.findOneAndUpdate(
            { _id: rating.expertId },
            { $set: { averageRating: averageRating } }
        )

        const responseMessage =
            status === 'approved'
                ? ResponseMessage.RATING_APPROVED
                : ResponseMessage.RATING_REJECTED

        return res.status(200).json({
            status: StatusCodes.OK,
            message: responseMessage,
            data: updatedRating,
        })
    } catch (error) {
        // Assuming `handleErrorResponse` is a custom function to handle errors
        return handleErrorResponse(res, error)
    }
}

//#region getRatingAndReviewById
export const getRatingAndReviewById = async (req, res) => {
    try {
        const { id } = req.query
        const rating = await ReviewAndRating.findOne({
            _id: id,
            isDeleted: false,
        })
            .populate('expertId', 'name')
            .populate('userId', 'name')
        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.RATING_AND_REVIEW_DETAILS,
            data: rating,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
