import mongoose from 'mongoose'

const ReviewRatingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
            required: false,
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
            required: false,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        rating: {
            type: Number,
            required: false,
        },
        review: {
            type: String,
            required: false,
        },
        ratingAndReviewStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const ReviewAndRating = mongoose.model('reviewandrating', ReviewRatingSchema)
export default ReviewAndRating
