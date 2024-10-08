import mongoose from 'mongoose'

const returnOrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        assignedExpert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        reason: {
            type: String,
        },
        reviewDetails: {
            type: String,
        },
        imageByUser: [
            {
                file: {
                    type: String,
                },
            },
        ],
        imageByExpert: [
            {
                file: {
                    type: String,
                },
            },
        ],
        status: {
            type: String,
            enum: ['pending', 'accepted', 'approved', 'rejected'],
            default: 'pending',
        },
        expertAssignmentStatus: {
            type: String,
            enum: ['NotAssigned', 'Assigned', 'Reassigned'],
            default: 'NotAssigned',
        },
        // expertAssignmentResult: {
        //     type: String,
        //     enum: ['Pending', 'ReturnAccept', 'ReturnNotAccept'],
        //     default: 'Pending',
        // },
        expertReview: {
            type: Boolean,
            default: false,
        },
        returnOrderId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('ReturnOrder', returnOrderSchema)
