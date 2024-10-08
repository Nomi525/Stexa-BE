import { ResponseMessage } from '../../utils/ResponseMessage.js'
import StatusCodes from 'http-status-codes'
import Expert from '../../models/Expert.js'
import { handleErrorResponse } from '../../services/CommonService.js'

import {} from // sendVerificationEmail,
// sendVerificationEmailOTP,
'../../services/EmailServices.js'
import ReviewAndRating from '../../models/ReviewAndRating.js'

export const getExpertDetails = async (req, res) => {
    try {
        const data = await Expert.findById({ _id: req.expert }).select(
            'name email image phoneNumber averageRating address city state country zipCode specialization file'
        )

        return res.status(200).json({
            message: ResponseMessage.EXPERT_DETAILS,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const removeRatingAndReview = async (req, res) => {
    try {
        const { id } = req.query

        const ratingToRemove = await ReviewAndRating.findById(id)

        if (!ratingToRemove) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.RATING_NOT_FOUND,
                data: [],
            })
        }

        const expertId = ratingToRemove.expertId

        await ReviewAndRating.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true } },
            { new: true }
        )

        const ratings = await ReviewAndRating.find({
            expertId,
            isDeleted: false,
        })

        // Calculate average rating and update the expert's averageRating
        let sumOfRatings = ratings.reduce(
            (total, rating) => total + rating.rating,
            0
        )

        const totalNumberOfRatings = ratings.length
        const averageRating = totalNumberOfRatings
            ? sumOfRatings / totalNumberOfRatings
            : 0

        await Expert.findByIdAndUpdate(expertId, { $set: { averageRating } })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.RATING_AND_REVIEW_REMOVED,
            data: [],
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

//#endregion
//#region ratingActiveDeActive
export const ratingActiveDeActiveStatus = async (req, res) => {
    try {
        const rating = await ReviewAndRating.findOne({
            _id: req.body.id,
            isDeleted: false,
            isActive: true,
        })
        if (!rating) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.RATING_NOT_FOUND,
            })
        } else {
            const newActiveStatus = !rating.isActive

            const updatedRating = await ReviewAndRating.updateOne(
                { _id: req.body.id },
                { $set: { isActive: newActiveStatus } },
                { new: true }
            )

            return res.status(200).json({
                status: StatusCodes.OK,
                message: !newActiveStatus
                    ? ResponseMessage.RATING_DEACTIVE
                    : ResponseMessage.RATING_ACTIVE,
                data: updatedRating,
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}
//#endregion
