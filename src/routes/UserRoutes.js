import router from 'express'
const userRouter = router()

import {
    getAllSpecialization,
    getFaqList,
    getFaqListUserSide,
    getSettings,
} from '../controller/Admin/AdminController.js'
import { getAllBanner } from '../controller/Admin/BannerController.js'
import {
    getAllStitchingCategory,
    getAllStitchingSuperCategory,
    getAllSubCategory,
    getSingleStitchingCategory,
    getSubCategoryByCategoryId,
    getSubCategoryById,
} from '../controller/Admin/CategoryController.js'

import {
    addEditExpert,
    // getAllExperts,
    getSingleExpert,
} from '../controller/Admin/ExpertController.js'
import {
    addBooking,
    bookingCancel,
    bookingReschedule,
    editBooking,
    getCurrentAndPastBooking,
    getJobCardBooking,
    getMyAllrescheduleBooking,
    getMyrescheduleBooking,
    getRecentAndPastBookingExpertList,
    getSingleBooking,
    removeBooking,
} from '../controller/User/BookingController.js'
import {
    // removeRatingAndReview,
    // ratingActiveDeActiveStatus,
    getAllRatingAndReview,
    getRatingAndReviewExpert,
    ratingAndReviewExpert,
} from '../controller/User/RatingAndReview.js'
import {
    contactUs,
    deleteUser,
    login,
    otpGenerate,
    profileEdit,
    registerUser,
    updateFCMToken,
    verifyOtp,
    // expertsDataFilter,
    // forgotPassword,
    // resetPassword,
    // changePassword,
    // updateProfileImage,
} from '../controller/User/UserController.js'
import {
    addProductWishList,
    productListingByUserId,
    removeWishiListProduct,
} from '../controller/User/WhisListController.js'
import { auth, expertAuth } from '../middleware/Auth.js'
import upload from '../middleware/FileUpload.js'
import { allUploadsDir } from '../utils/unLinkFile.js'
import { applyDicsountAndOffer } from '../controller/Admin/ProductController.js'
import {
    addUpdateProductToCart,
    applyCouponCode,
    bookingConvertToOrder,
    cancelOrder,
    deleteCart,
    editPlaceOrder,
    getCart,
    getOrderHistory,
    getOrderList,
    getQuotations,
    getSingleQuotation,
    // getSingleQuotationsByUser,
    orderCancel,
    placeOrder,
    productQuantityUpdate,
    quotationReject,
    removeProductFromCart,
    reorder,
} from '../controller/User/CartController.js'
import {
    getUserChatBookingWiseList,
    getUserChatRoomWiseList,
} from '../controller/Common/CommonController.js'
import { createBookingId, createRoomId } from '../services/Socket.js'
import { createReturnOrder } from '../controller/User/ReturnOrderController.js'
import { invoiceDownload } from '../services/invoice.js'

userRouter.post('/register-user', registerUser)
userRouter.post('/user-otp', otpGenerate)
userRouter.post('/login-user', login)
userRouter.patch(
    '/profile-edit',
    auth,
    upload(allUploadsDir.other).single('image'),
    // upload(allUploadsDir.desgin).array('images'),
    profileEdit
)
userRouter.patch(
    '/add-edit-expert-profile',
    expertAuth,
    upload(allUploadsDir.expert).fields([
        { name: 'image', maxCount: 1 },
        { name: 'design', maxCount: 10 },
    ]),
    addEditExpert
)
userRouter.post(
    '/verify-otp',
    upload(allUploadsDir.expert).fields([
        { name: 'image', maxCount: 1 },
        { name: 'design', maxCount: 10 },
    ]),
    verifyOtp
)
userRouter.post('/contact-us', auth, contactUs)
userRouter.delete('/delete-user', auth, deleteUser)
userRouter.patch('/update-fcm', auth, updateFCMToken)

//#region Expert
userRouter.get('/get-single-expert', auth, getSingleExpert)

//#endregion
//#region rating and review
userRouter.post('/rating-and-review-expert', auth, ratingAndReviewExpert)
userRouter.get('/get-rating-and-review-expert', auth, getRatingAndReviewExpert)
userRouter.get('/get-all-rating-and-review', auth, getAllRatingAndReview)
//#endregion
//#region user bookings
userRouter.post('/add-Booking', auth, addBooking)
userRouter.post('/edit-booking', auth, editBooking)
userRouter.post('/booking-reschedule', auth, bookingReschedule)
userRouter.patch('/booking-cancel', auth, bookingCancel)
userRouter.get('/get-single-booking', auth, getSingleBooking)
userRouter.delete('/remove-booking', auth, removeBooking)
userRouter.get('/get-current-and-past-booking', auth, getCurrentAndPastBooking)
userRouter.get(
    '/get-recent-and-past-booking',
    auth,
    getRecentAndPastBookingExpertList
)
//#endregion

//#region user product wishlist
userRouter.post('/add-product-wishlist', auth, addProductWishList)
userRouter.get('/my-wishlist-product', auth, productListingByUserId)
userRouter.delete('/remove-product-wishlist', auth, removeWishiListProduct)
//#endregion

//#specialization
userRouter.get('/get-all-specialization', auth, getAllSpecialization)
userRouter.get('/get-all-banner', getAllBanner)
userRouter.get('/get-all-stitching-category', auth, getAllStitchingCategory)
userRouter.get(
    '/get-all-stitching-super-category',
    auth,
    getAllStitchingSuperCategory
)
userRouter.post(
    '/get-single-stitching-category',
    auth,
    getSingleStitchingCategory
)
userRouter.get('/get-all-subcategory', auth, getAllSubCategory)
userRouter.get('/get-single-subcategory-by-id', auth, getSubCategoryById)
userRouter.get(
    '/get-subcategory-by-category-id',
    auth,
    getSubCategoryByCategoryId
)
userRouter.post('/apply-dicsount-and-offer', auth, applyDicsountAndOffer)
userRouter.get('/get-settings', auth, getSettings)

//cart
userRouter.post('/add-to-cart', auth, addUpdateProductToCart)
userRouter.post('/remove-product-cart', auth, removeProductFromCart)
userRouter.get('/get-cart', auth, getCart)
userRouter.post('/product-quantity-update', auth, productQuantityUpdate)
userRouter.delete('/delete-cart', auth, deleteCart)
userRouter.post('/placeorder', auth, placeOrder)
userRouter.post('/apply-couponcode', auth, applyCouponCode)
userRouter.post('/cancelorder', auth, cancelOrder)
userRouter.get('/my-orderlist', auth, getOrderList)

//Chat
userRouter.get('/get-user-chat-booking-wise', auth, getUserChatBookingWiseList)
userRouter.get('/get-user-chat-room-wise', auth, getUserChatRoomWiseList)
userRouter.post('/create-room', auth, createRoomId)
userRouter.post('/create-booking-room', auth, createBookingId)

userRouter.get('/get-reschedulebooking-by-user', auth, getMyrescheduleBooking)
userRouter.get(
    '/get-all-reschedulebooking-by-user',
    auth,
    getMyAllrescheduleBooking
)
//#endregion

//#region user order
userRouter.get('/get-job-card', auth, getJobCardBooking)
userRouter.patch('/edit-place-order', auth, editPlaceOrder)
userRouter.post('/booking-convert-to-order', auth, bookingConvertToOrder)
userRouter.post('/re-order', auth, reorder)
userRouter.get('/get-order-history', auth, getOrderHistory)
userRouter.patch('/order-cancel', auth, orderCancel)
//#endregion

//#region user quotations
userRouter.get('/get-quotations-list', auth, getQuotations)
// userRouter.get(
//     '/get-single-quotations-by-user',
//     auth,
//     getSingleQuotationsByUser
// )
userRouter.patch('/quotation-reject', auth, quotationReject)
userRouter.get('/get-quotations', auth, getSingleQuotation)

//#endregion
userRouter.post(
    '/order-return',
    auth,
    upload(allUploadsDir.other).fields([{ name: 'image', maxCount: 2 }]),
    createReturnOrder
)
//#CMS & FAQ
userRouter.get('/faqs', getFaqListUserSide)
//http://localhost:3048/api/user/invoice-download?id=668f726393221f7ef91a5211
userRouter.get('/invoice-download', invoiceDownload)

export default userRouter
