import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        fashionConsultantAmount: {
            type: Number,
        },
        orderPartialPayAmount: {
            type: Number,
        },
        orderTotalPayAmount: {
            type: Number,
        },
        bookingPartialPayAmount: {
            type: Number,
        },
        paymentId: {
            type: String,
        },
        paymentStatus: {
            type: String,
        },
        paymentResponse: {
            type: JSON,
        },
        serviceType: {
            type: String,
        },
        orderPaymentStatus: {
            type: String,
        },
    },
    { timestamps: true }
)

export default mongoose.model('Transaction', transactionSchema)
