import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        image: {
            type: String,
        },
        superCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperCategory',
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

export default mongoose.model('Category', categorySchema)
