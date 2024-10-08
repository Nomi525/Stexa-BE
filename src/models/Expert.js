import mongoose from 'mongoose'

const expertSchema = new mongoose.Schema(
    {
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'rolepermission',
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        password: {
            type: String,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        userType: {
            type: String,
            default: 'expert',
        },
        experience: {
            type: String,
        },
        qulifications: {
            type: String,
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
        specialization: {
            type: Array,
        },
        type: {
            type: String,
            enum: ['Stitching', 'Fashion consultation'],
        },

        date: {
            type: Number,
        },
        startTime: [
            {
                type: Number,
            },
        ],

        endTime: [
            {
                type: Number,
            },
        ],

        grade: {
            type: String,
        },
        image: {
            type: String,
        },
        designImage: [
            {
                file: {
                    type: String,
                },
            },
        ],
        expertCharges: {
            type: Number,
        },
        adminRating: {
            type: String,
            default: 0,
        },
        adminReview: {
            type: String,
        },
        averageRating: {
            type: String,
        },
        consultationCharges: {
            type: Number,
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
        token: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isAvailable: {
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

const Expert = mongoose.model('expert', expertSchema)
export default Expert
