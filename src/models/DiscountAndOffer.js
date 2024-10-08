import mongoose from 'mongoose'

const discountAndOfferSchema = new mongoose.Schema(
    {
        couponCode: {
            type: String,
            required: true,
            unique: true,
        },
        productId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: false,
            },
        ],

        serviceId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Service',
                required: false,
            },
        ],

        discountType: {
            type: String, // 'percentage' or 'constant'
            enum: ['percentage', 'constant'],
            default: 'percentage',
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
        },
        maxUsageCount: {
            type: Number,
            required: true,
        },
        totalUsedCount: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        serviceProductType: {
            type: String,
            enum: ['service', 'product'],
            default: 'service',
            required: false,
        },
    },
    { timestamps: true, timeseries: true }
)

const DiscountAndOffer = mongoose.model(
    'DiscountAndOffer',
    discountAndOfferSchema
)
export default DiscountAndOffer
