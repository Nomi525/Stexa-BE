import mongoose from 'mongoose'

const refundSchema = new mongoose.Schema(
    {
        refundId: {
            type: String,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        refundAmount: {
            type: Number,
        },

        reason: {
            type: String,
        },
        bookingStatus: {
            type: String,
        },
        orderStatus: {
            type: String,
        },
        referModel: {
            type: String,
            required: false,
            enum: ['expert', 'User', 'admin'],
        },
        orderCanceledBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'referModel',
            required: false,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)
const Refund = mongoose.model('Refund', refundSchema)
export default Refund
