import mongoose from 'mongoose'
import User from './User.js'

const LogsSchema = new mongoose.Schema({
    Type: { type: String, require: false },
    Object_id: { type: mongoose.Schema.Types.ObjectId },
    Object_Type: {
        type: String,
        require: false,
    },
    Action_Log: {
        type: String,
        require: false,
    },
    Comment: {
        type: String,
        require: false,
    },
    Created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },

    Deletestatus: {
        type: Boolean,
        default: false,
    },
    Create_at: {
        type: Date,
        default: Date.now,
    },
})

const Logs = mongoose.model('logs', LogsSchema)
export default Logs
