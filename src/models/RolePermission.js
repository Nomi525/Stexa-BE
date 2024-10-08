import mongoose from 'mongoose'

const rolePermissionSchema = new mongoose.Schema(
    {
        role: {
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
        permissions: {
            type: Array,

            default: null,
        },
    },
    { timestamps: true }
)
export default mongoose.model('rolepermission', rolePermissionSchema)
