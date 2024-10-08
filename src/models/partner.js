import mongoose from 'mongoose'

const partnerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        email: {
            type: String,
        },
        address: {
            type: String,
        },
        qualification: {
            type: String,
        },
        descirption: {
            type: String,
        },
        type: {
            type: String,
            enum: ['Fashion designer', 'Boutique'],
        },
        business_Registration_details: {
            type: String,
        },
        gst_number: {
            type: String,
        },
        business_address: {
            type: String,
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'Approved', 'Rejected'],
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        rejectReason: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)
const Partner = mongoose.model('partner', partnerSchema)
export default Partner
