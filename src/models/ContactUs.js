import mongoose from 'mongoose'
const contactUsSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
        },
        email: {
            type: String,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        message: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)
const ContactUs = mongoose.model('contactus', contactUsSchema)
export default ContactUs
