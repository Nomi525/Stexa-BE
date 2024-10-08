import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
        },
        walletId: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            lowercase: true,
        },
        password: {
            type: String,
            required: false,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        zipCode: {
            type: String,
            required: false,
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        image: {
            type: String,
            default: null,
        },
        token: {
            type: String,
            required: false,
        },
        fcmToken: {
            type: String,
            required: false,
        },
        loginType: {
            type: String,
            enum: ['manual', 'google', 'facebook'],
        },
        otp: {
            type: String,
            default: null,
        },
        otpExpire: {
            type: Number,
            default: null,
        },
        otpCount: {
            type: Number,
            default: 0,
        },
        otpType: {
            type: String,
        },
        userType: {
            type: String,
            default:"user"
        },

        isDeleted: {
            type: Boolean,
            default: false,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
            required: false,
        },
        isOtpVerified: {
            type: Boolean,
            default: false,
        },
        isverified: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['approved', 'rejected', 'pending'],
            default: 'pending',
        },
    },
    { timestamps: true }
)

const User = mongoose.model('User', userSchema)
export default User
