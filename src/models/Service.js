import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
)

const Service = mongoose.model('Service', serviceSchema)
export default Service
