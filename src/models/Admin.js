import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            // lowercase: true,
        },
        password: {
            type: String,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        token: {
            type: String,
        },
        image: {
            type: String,
        },
        address: {
            type: String,
        },

        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'rolepermission',
        },
        otp: {
            type: Number,
            default: null,
        },
        otpExpire: {
            type: Number,
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            default: 'Pending',
            enum: ['Pending', 'Active', 'Deactive'],
        },
        type: {
            type: String,
            enum: ['Admin', 'SubAdmin'],
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const Admin = mongoose.model('admin', AdminSchema)
export default Admin
