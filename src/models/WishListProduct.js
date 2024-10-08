import mongoose from 'mongoose'

// const productWishListSchema = new mongoose.Schema(
//     {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true,
//         },
//         productId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Product',
//             required: true,
//         },
//         serviceProductId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'ServicesProductList',
//             required: true,
//         },
//     },
//     { timestamps: true }
// )

// export default mongoose.model('WishlistProduct', productWishListSchema)

const wishListProductSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        serviceProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServicesProductList',
        },
        count: {
            type: Number,
            default: 1,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

wishListProductSchema.pre('validate', function (next) {
    if (!this.productId && !this.serviceProductId) {
        next(
            new Error(
                'You must provide either a productId or a serviceProductId.'
            )
        )
    } else {
        next()
    }
})

export default mongoose.model('WishlistProduct', wishListProductSchema)
