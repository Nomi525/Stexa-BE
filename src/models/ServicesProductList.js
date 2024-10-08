import mongoose from 'mongoose'

const servicesProductListSchema = new mongoose.Schema(
    {
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
        name: {
            type: String,
        },
        productImage: [
            {
                file: {
                    type: String,
                },
            },
        ],
        description: {
            type: String,
        },
        fabricServiceType: [
            {
                type: String,
            },
        ],
        quantity: {
            type: Number,
            default: 0,
            require: false,
        },
        price: {
            type: Number,
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

export default mongoose.model('ServicesProductList', servicesProductListSchema)
