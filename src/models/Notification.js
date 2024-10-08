import mongoose from 'mongoose'
const notificationschema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'booking',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'User',
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'expert',
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin',
        },
        title: {
            type: String,
            required: false,
        },
        text: {
            type: String,
            required: false,
        },
        isRead: {
            type: Boolean,
            required: false,
            default: false,
        },
        notificationType: {
            type: String,
            required: false,
        },
        isDeleted: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

export const Notification = mongoose.model('Notification', notificationschema)
