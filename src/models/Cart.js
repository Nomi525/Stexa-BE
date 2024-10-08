import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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
            },
        ],

        totalQuantity: {
            type: Number,
            require: false,
        },
        totalamount: {
            type: Number,
            require: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

export default mongoose.model('cart', cartSchema)
