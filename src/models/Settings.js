import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
    {
        tokenAmount: {
            type: Number,
        },
        gst: {
            type: Number,
        },
        email: {
            type: String,
        },
    },
    { timestamps: true }
)

const Settings = mongoose.model('Settings', settingsSchema)
export default Settings
