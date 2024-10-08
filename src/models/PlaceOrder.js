import mongoose from 'mongoose'

const PlaceOrderSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        orderId: {
            type: String,
        },
        shippingDetails: {
            shippingCarrier: { type: String },
            trackingId: { type: String },
            currentStatusOfShipment: {
                type: String,
            },
            deliveryLocation: { type: String },
            shippmentCost: { type: Number },
        },
        orderDateTime: {
            type: Number,
        },
        deliveryDateTime: {
            type: Number,
        },

        totalPartialPayAmount: {
            type: Number,
        },
        quotationPartialPayAmount: {
            type: Number,
        },
        quotationPartialPendingAmount: {
            type: Number,
        },
        quotationTotalAmount: {
            type: Number,
        },
        orderPaymentStatus: {
            type: String,
        },
        orderType: {
            type: String,
            enum: ['order', 'reOrder'],
            default: 'order',
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
        orderCancel: {
            type: Boolean,
            default: false,
        },
        isOrderReturn: {
            type: Boolean,
            default: false,
        },
        orderCancelDate: {
            type: Date,
        },
        orderRefund: {
            type: String,
        },
        orderReturnStatus: {
            type: String,
        },
        status: {
            type: String,
            default: 'Confirmed',
            enum: [
                'Pending',
                'Confirmed',
                'In Progress',
                'Shipped',
                'Delivered',
                'Cancelled',
            ],
        },
        expertAssignmentStatus: {
            type: String,
        },
        assignedExpertForReturn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
    },

    {
        timestamps: true,
    }
)

const Order = mongoose.model('Order', PlaceOrderSchema)
export default Order
