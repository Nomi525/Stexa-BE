import mongoose from 'mongoose'

const produtSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        image: {
            type: Array,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
        },
        quantity: {
            type: Number,
        },
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
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

export default mongoose.model('Product', produtSchema)
