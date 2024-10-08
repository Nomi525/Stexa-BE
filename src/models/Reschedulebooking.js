import mongoose from 'mongoose'

const resecheduleBookingSchema = new mongoose.Schema(
    {
        mybookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },
        bookingId: {
            type: String,
        },
        rescheduleBookingDateTime: {
            type: Number,
        },
        previousBookingDateTime: {
            type: Number,
        },

        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'approve', 'reject'],
        },
        requestBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'referModel',
            required: false,
        },
        referModel: {
            type: String,
            required: false,
            enum: ['expert', 'User', 'admin'],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

const ResecheduleBooking = mongoose.model(
    'resecheduleBooking',
    resecheduleBookingSchema
)
export default ResecheduleBooking
