import mongoose from 'mongoose'

const subcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        image: {
            type: String,
        },
        description: {
            type: String,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        superCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperCategory',
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
    { timestamps: true },
    { versionKey: false }
)

const SubCategory = mongoose.model('SubCategory', subcategorySchema)
export default SubCategory
