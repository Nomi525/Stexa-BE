import mongoose from 'mongoose'

const quotationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },

        name: {
            type: String,
        },
        fabricQuality: {
            type: String,
        },
        fabricLength: {
            type: String,
        },
        fabricAmount: {
            type: Number,
        },
        stitchingAmount: {
            type: Number,
        },
        totalAmount: {
            type: Number,
        },
        partialPayAmount: {
            type: Number,
        },
        partialPendingAmount: {
            type: Number,
        },
        paymentDetails: [
            {
                paymentId: {
                    type: String,
                },
                paymentStatus: {
                    type: String,
                },
                paymentResponse: {
                    type: JSON,
                },
            },
        ],

        // paymentId: {
        //     type: String,
        // },
        // paymentStatus: {
        //     type: String,
        // },
        // paymentResponse: {
        //     type: JSON,
        // },
        quotationStatus: {
            type: String,
            default: 'pending',
            enum: ['pending', 'accept', 'reject'],
        },

        isAccepted: {
            type: Boolean,
            default: false,
        },
        isFabricAmountPaid: {
            type: Boolean,
            default: false,
        },
        isFullAmountPaid: {
            type: Boolean,
            default: false,
        },
        fabricImage: [
            {
                file: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true }
)

export default mongoose.model('Quotation', quotationSchema)
