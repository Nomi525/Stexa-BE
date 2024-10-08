import mongoose from 'mongoose'

const couponUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscountAndOffer',
    },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: Date.now },
})

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema)

export default CouponUsage
