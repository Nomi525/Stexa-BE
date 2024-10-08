import mongoose from 'mongoose'

const specializationSchema = new mongoose.Schema(
    {
        specializationName: {
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
    {
        timestamps: true,
    }
)
const Specialization = mongoose.model('specialization', specializationSchema)
export default Specialization
