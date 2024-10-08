import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        orderPaymentStatus: {
            type: String,
        },
        reOrder: {
            reOrderId: {
                type: String,
            },
            reOrderStatus: {
                type: String,
            },
            reOrderDateTime: {
                type: Number,
            },
        },
        bookingDateTime: {
            type: Number,
        },
        gst: {
            type: Number,
        },
        deliveryDateTime: {
            type: Number,
        },
        rescheduleBookingDateTime: {
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
        email: {
            type: String,
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        country: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        serviceType: {
            type: String,
        },

        fcmToken: {
            type: String,
            required: false,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                    require: false,
                },
                price: {
                    type: Number,
                    require: false,
                },
                subTotal: {
                    type: Number,
                    require: false,
                },
            },
        ],
        ServicesAndProducts: [
            {
                ServicesProductId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'ServicesProductList',
                },
                quantity: {
                    type: Number,
                    require: false,
                },
                price: {
                    type: Number,
                    require: false,
                },
                subTotal: {
                    type: Number,
                    require: false,
                },
                serviceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Service',
                },
                superCategoryId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'SuperCategory',
                },
                categoryId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Category',
                },
                subCategoryId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'SubCategory',
                },
                customize: {
                    customizeSize: {
                        type: String,
                    },
                    customizeColor: {
                        type: String,
                    },
                    customizeAdditional: {
                        type: String,
                    },
                    image: [
                        {
                            file: {
                                type: String,
                            },
                        },
                    ],
                },

                fabricServiceType: {
                    type: String,
                },
                measurements: {
                    length: {
                        type: String,
                    },
                    shoulder: {
                        type: String,
                    },
                    arm_hole: {
                        type: String,
                    },
                    upper_bust: {
                        type: String,
                    },
                    bust: {
                        type: String,
                    },
                    empire_waist: {
                        type: String,
                    },
                    waist: {
                        type: String,
                    },
                    yoke: {
                        type: String,
                    },
                    hip: {
                        type: String,
                    },
                    apex: {
                        type: String,
                    },
                    slit: {
                        type: String,
                    },

                    front_width: {
                        type: String,
                    },
                    neck_round: {
                        type: String,
                    },
                    sleeve_length: {
                        type: String,
                    },
                    bicep_round: {
                        type: String,
                    },
                    sleeve_round: {
                        type: String,
                    },
                    elbow_round: {
                        type: String,
                    },
                    pant_length: {
                        type: String,
                    },
                    croach_point: {
                        type: String,
                    },
                    thigh_round: {
                        type: String,
                    },
                    knee_round: {
                        type: String,
                    },
                    ankle_round: {
                        type: String,
                    },
                },
                measurementsEditBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'referModel',
                    required: false,
                },
            },
        ],
        sameMeasurementForAllProduct: {
            type: Boolean,
            default: false,
        },
        amount: {
            type: Number,
            default: 0,
        },
        reamingAmount: {
            type: Number,
            default: 0,
        },
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DiscountAndOffer',
        },
        couponCode: {
            type: String,
            require: false,
        },
        couponType: {
            type: String,
            require: false,
        },
        couponAmount: {
            type: Number,
            require: false,
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

        bookingType: {
            type: String,
            enum: ['online', 'offline'],
        },
        orderTotal: {
            type: Number,
            require: false,
        },
        grandTotal: {
            type: Number,
            require: false,
        },
        TotalQuantity: {
            type: Number,
            require: false,
        },
        discount: {
            type: Number,
            require: false,
        },
        totalPayAmount: {
            type: Number,
            require: false,
        },
        quotationTotalAmount: {
            type: Number,
        },
        quotationPartialPendingAmount: {
            type: Number,
        },

        quotationPartialPayAmount: {
            type: Number,
        },
        descirption: {
            type: String,
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'approve', 'reject', 'completed', 'cancelled'],
        },
        orderStatus: {
            type: String,
        },
        orderCancelDate: {
            type: Date,
        },
        deliveryAddress: {
            name: {
                type: String,
            },
            email: {
                type: String,
            },
            phoneNumber: {
                type: String,
            },
            address: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            country: {
                type: String,
            },
            zipCode: {
                type: String,
            },
        },
        referModel: {
            type: String,
            required: false,
            enum: ['expert', 'User', 'admin'],
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'approve', 'reject'],
        },
        bookingCancel: {
            type: Boolean,
            default: false,
        },
        bookingRefund: {
            type: String,
        },
        orderReturnStatus: {
            type: String,
        },

        bookingCanceledBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'referModel',
            required: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

const Booking = mongoose.model('booking', bookingSchema)
export default Booking
