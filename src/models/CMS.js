import mongoose from 'mongoose'

const cmsSchema = new mongoose.Schema(
    {
        privacyPolicy: {
            type: String,
        },
        termsCondition: {
            type: String,
        },
        refundPolicy: {
            type: String,
        },
        aboutUs: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        legal_notice: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('cms', cmsSchema)
