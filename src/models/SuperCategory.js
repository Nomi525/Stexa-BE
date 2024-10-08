import mongoose from 'mongoose'

const superCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
        image: {
            type: String,
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

export default mongoose.model('SuperCategory', superCategorySchema)
