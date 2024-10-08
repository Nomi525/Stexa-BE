import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
    {
        bannerName: {
            type: String,
        },
        bannerImage: {
            type: String,
        },
        bannerType: {
            type: String,
            default: 'Banner',
            enum: ['Banner', 'Offer'],
        },
        platformType: {
            type: String,
            default: 'Web',
            enum: ['Web', 'Mobile'],
        },
        description: {
            type: String,
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
export default mongoose.model('Banner', bannerSchema)
