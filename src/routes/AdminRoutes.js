import router from 'express'
const adminRouter = router()
import upload from '../middleware/FileUpload.js'
import { allUploadsDir } from '../utils/unLinkFile.js'
import {
    addRole,
    editRole,
    removeRole,
    getAllRole,
    getRolePermissionsById,
    getAllRoleWithName,
} from '../controller/Admin/RoleMaster.js'
import {
    addEditCmsDetails,
    addEditFAQs,
    addEditSpecialization,
    addEditSubAdmin,
    adminDashboard,
    adminSettings,
    changePassword,
    contactUsList,
    forgotPassword,
    getAdmin,
    getAllSpecialization,
    // getAllSpecializationList,
    getAllSubAdmin,
    getFaqList,
    getSettings,
    getsingleSpecialization,
    login,
    logout,
    removeAdmin,
    removeFaq,
    removeSpecialization,
    resendOTP,
    resetPassword,
    subAdminActiveDeactive,
    toggleFaqStatus,
    updateAdmin,
    verifyOtp,
} from '../controller/Admin/AdminController.js'
import {
    addEditBanner,
    bannerActiveDeActiveStatus,
    bannerListingsToCSVExport,
    getAllBanner,
    getSingleBanner,
    removeBanner,
} from '../controller/Admin/BannerController.js'
import { adminAuth } from '../middleware/Auth.js'
import {
    addEditExpert,
    expertActiveDeactiveStatus,
    expertListingsToCSVExport,
    getAllExperts,
    getAllExpertsAd,
    getAllExpertsList,
    getSingleExpert,
    removeExpert,
} from '../controller/Admin/ExpertController.js'
import {
    addEditCategory,
    addEditSubCategory,
    addEditSuperCategory,
    getAllStitchingCategory,
    getAllStitchingSuperCategory,
    getAllStitchingSuperCategorybyServiceId,
    getAllSubCategory,
    getCategoryBySuperCategoryId,
    getSingleStitchingCategory,
    getSingleStitchingSuperCategory,
    getSubCategoryByCategoryId,
    getSubCategoryById,
    removeCategory,
    removeStitchingSuperCategory,
    removeSubCategory,
} from '../controller/Admin/CategoryController.js'
import {
    addEditDiscountAndOffer,
    addEditProduct,
    addEditService,
    dicscountAndOfferActiveDeactiveStatus,
    getAllDiscountAndOffer,
    getAllProduct,
    getAllService,
    getSingleDiscountAndOffer,
    getSingleProduct,
    offerListingsToCSVExport,
    removeDiscountAndOffer,
    removeProduct,
    removeservices,
} from '../controller/Admin/ProductController.js'
import {
    getUserList,
    deleteUser,
    getSingleUser,
    addEditUser,
    userActiveDeactiveStatus,
} from '../controller/User/UserController.js'

import {
    approveAndRejectPartner,
    getAllPartners,
    getSinglePartner,
} from '../controller/Admin/PartnerController.js'
import {
    approveBooking,
    approveRejectRescheduleBooking,
    bookingCancel,
    bookingListingsToCSVExport,
    bookingReschedule,
    deleteBookingReSerequest,
    editBooking,
    editReseduelBooking,
    getAllBookings,
    getAllrescheduleBooking,
    getSingleBooking,
    getrescheduleBooking,
    updatebookingexpert,
} from '../controller/User/BookingController.js'
import {
    approveRejectRatingAndReview,
    getAllRatingAndReview,
    getRatingAndReviewById,
    //getRatingAndReviewExpert,
    // ratingActiveDeActiveStatus,
    // removeRatingAndReview,
} from '../controller/User/RatingAndReview.js'
import {
    addEditServicesProductList,
    getAllServiceProductList,
    getSingleServiceProductList,
    removeServiceProductList,
} from '../controller/Admin/ServicesProductListController.js'
import {
    addeditAboutUs,
    getAdminRoomIdList,
    getAllTransactionHistory,
    getSingleTransactionHistory,
} from '../controller/Common/CommonController.js'
import {
    getAllRefund,
    getSingleRefund,
    refundListingsToCSVExport,
    removeRefund,
} from '../controller/Admin/RefundController.js'
import {
    addShippingDetails,
    getAllOrderList,
    getSingleOrder,
    updateOrderStatus,
} from '../controller/User/CartController.js'
import {
    getAllReturnOrder,
    getReturnOrderById,
    orderRefundApproveRejectByAdmin,
    reassignExpert,
    updateReturnOrderStatus,
} from '../controller/User/ReturnOrderController.js'
//#region Admin
// adminRouter.post(
//     '/register',
//     upload(allUploadsDir.other).single('image'),
//     register
// )
adminRouter.post('/login', login)
adminRouter.get('/logout', adminAuth, logout)
adminRouter.post('/forgot-password', forgotPassword)
adminRouter.post('/verify-otp', verifyOtp)
adminRouter.post('/resend-otp', resendOTP)
adminRouter.post('/reset-password', resetPassword)
adminRouter.post('/change-password', adminAuth, changePassword)
adminRouter.patch(
    '/update-admin',
    adminAuth,
    upload(allUploadsDir.other).single('image'),
    updateAdmin
)

//#region subAdmin
adminRouter.post('/add-edit-subadmin', adminAuth, addEditSubAdmin)
adminRouter.delete('/remove-subadmin', adminAuth, removeAdmin)
adminRouter.get('/subadmins', adminAuth, getAllSubAdmin)
adminRouter.get('/subadmin-details', adminAuth, getAdmin)
adminRouter.patch(
    '/subadmin-active-deactive',
    adminAuth,
    subAdminActiveDeactive
)
//#endregion

//#endregion Role
adminRouter.post('/add-role', adminAuth, addRole)
adminRouter.patch('/edit-role', adminAuth, editRole)
adminRouter.delete('/remove-role/:id', adminAuth, removeRole)
adminRouter.get('/get-all-role', adminAuth, getAllRole)
adminRouter.get('/get-all-role-with-name', adminAuth, getAllRoleWithName)
adminRouter.get(
    '/get-role-permissions-by-id',
    adminAuth,
    getRolePermissionsById
)
//#endregion
//#region Dashboard
adminRouter.get('/admin-dashboard', adminAuth, adminDashboard)
//#endregion
//#region Banner
adminRouter.post(
    '/add-edit-banner',
    adminAuth,
    upload(allUploadsDir.banner).single('bannerImage'),
    addEditBanner
)
adminRouter.get('/get-all-banner', adminAuth, getAllBanner)

adminRouter.patch('/remove-banner', adminAuth, removeBanner)
adminRouter.get('/get-single-banner', adminAuth, getSingleBanner)
adminRouter.get('/banner-listings-to-csv', adminAuth, bannerListingsToCSVExport)
adminRouter.patch(
    '/banner-active-deactive-status',
    adminAuth,
    bannerActiveDeActiveStatus
)

//#region cms
adminRouter.post('/add-edit-cms', adminAuth, addEditCmsDetails)
adminRouter.post('/add-edit-faqs', adminAuth, addEditFAQs)
adminRouter.post('/toggle-faqs-status', adminAuth, toggleFaqStatus)
adminRouter.delete('/remove-faq', adminAuth, removeFaq)
adminRouter.get('/faqs', adminAuth, getFaqList)

//#endregion

//Region SuperCategory

adminRouter.post(
    '/add-edit-super-category',
    upload(allUploadsDir.category).single('image'),
    adminAuth,
    addEditSuperCategory
)
adminRouter.get(
    '/get-all-stitching-super-category',
    adminAuth,
    getAllStitchingSuperCategory
)
adminRouter.get(
    '/get-single-stitching-super-category',
    adminAuth,
    getSingleStitchingSuperCategory
)
adminRouter.post(
    '/remove-super-category',
    adminAuth,
    removeStitchingSuperCategory
)

//#region Category
adminRouter.post(
    '/add-edit-category',
    upload(allUploadsDir.category).single('image'),
    adminAuth,
    addEditCategory
)
adminRouter.get(
    '/get-all-stitching-category',
    adminAuth,
    getAllStitchingCategory
)
adminRouter.get(
    '/get-single-stitching-category',
    adminAuth,
    getSingleStitchingCategory
)
adminRouter.get(
    '/get-category-by-super-category-id',
    adminAuth,
    getCategoryBySuperCategoryId
)
adminRouter.post('/remove-category', adminAuth, removeCategory)
//#endregion

//#region SubCategory
adminRouter.post(
    '/add-edit-subcategory',
    adminAuth,
    upload(allUploadsDir.category).single('image'),
    addEditSubCategory
)
adminRouter.get('/get-all-subcategory', adminAuth, getAllSubCategory)
adminRouter.get(
    '/get-all-stitching-super-category-by-service-id',
    adminAuth,
    getAllStitchingSuperCategorybyServiceId
)
adminRouter.get('/get-single-subcategory-by-id', adminAuth, getSubCategoryById)
adminRouter.get(
    '/get-subcategory-by-category-id',
    adminAuth,
    getSubCategoryByCategoryId
)
adminRouter.delete('/remove-subcategory', adminAuth, removeSubCategory)

//#endregion
//#region user
adminRouter.get('/get-all-user', adminAuth, getUserList)
adminRouter.get('/get-single-user', adminAuth, getSingleUser)
adminRouter.delete('/delete-user', adminAuth, deleteUser)

adminRouter.post(
    '/add-edit-user',
    adminAuth,
    upload(allUploadsDir.user).single('image'),
    addEditUser
)
adminRouter.patch('/user-active-deactive', adminAuth, userActiveDeactiveStatus)
//#endregion
//#region contect us
adminRouter.get('/contact-us', adminAuth, contactUsList)
//#endregion

//#region Expert
adminRouter.post(
    '/add-edit-expert',
    adminAuth,
    upload(allUploadsDir.expert).fields([
        { name: 'image', maxCount: 1 },
        { name: 'design', maxCount: 10 },
    ]),
    addEditExpert
)
adminRouter.delete('/remove-expert', adminAuth, removeExpert)
adminRouter.get('/get-all-expert', adminAuth, getAllExpertsAd)
adminRouter.get('/get-all-expert-list', adminAuth, getAllExpertsList)
adminRouter.get('/get-single-expert', adminAuth, getSingleExpert)
adminRouter.patch(
    '/expert-active-deactive',
    adminAuth,
    expertActiveDeactiveStatus
)
adminRouter.get('/expert-listings-to-csv', expertListingsToCSVExport)

//#endregion

//#region Product
adminRouter.post(
    '/add-edit-product',
    adminAuth,
    upload(allUploadsDir.product).single('image'),
    addEditProduct
)
adminRouter.get('/get-all-product', adminAuth, getAllProduct)
adminRouter.get('/get-single-product', adminAuth, getSingleProduct)
adminRouter.delete('/remove-product', adminAuth, removeProduct)
//#endregion

//#region Discount And Offer
adminRouter.post('/add-edit-discount-offer', adminAuth, addEditDiscountAndOffer)
adminRouter.get('/get-all-discount-offer', adminAuth, getAllDiscountAndOffer)
adminRouter.get(
    '/get-single-discount-offer',
    adminAuth,
    getSingleDiscountAndOffer
)
adminRouter.delete('/remove-discount-offer', adminAuth, removeDiscountAndOffer)
adminRouter.get('/export-discount-offer', offerListingsToCSVExport)
adminRouter.patch(
    '/active-deactive-offer',
    dicscountAndOfferActiveDeactiveStatus
)
//#endregion

//#region Service
adminRouter.post(
    '/add-edit-service',
    adminAuth,
    upload(allUploadsDir.service).single('image'),
    addEditService
)
adminRouter.get('/get-all-service', adminAuth, getAllService)
adminRouter.post('/remove-service', adminAuth, removeservices)
//#endregion

//#region Partner
adminRouter.patch(
    '/approve-and-reject-partner',
    adminAuth,
    approveAndRejectPartner
)
adminRouter.get('/get-all-partners', adminAuth, getAllPartners)
adminRouter.get('/get-single-partner', adminAuth, getSinglePartner)

//#endregion

//#region Booking
adminRouter.get('/get-all-booking', adminAuth, getAllBookings)
adminRouter.post('/booking-reschedule', adminAuth, bookingReschedule)
adminRouter.patch('/booking-cancel', adminAuth, bookingCancel)
adminRouter.get('/get-single-booking', adminAuth, getSingleBooking)
adminRouter.patch('/approve-and-reject-booking', adminAuth, approveBooking)
adminRouter.patch('/update-booking-expert', adminAuth, updatebookingexpert)
adminRouter.post('/edit-booking', adminAuth, editBooking)
adminRouter.get('/booking-listings-to-csv', bookingListingsToCSVExport)
adminRouter.get('/getallreschedulebooking', adminAuth, getAllrescheduleBooking)
adminRouter.get('/getreschedulebooking', adminAuth, getrescheduleBooking)
adminRouter.post(
    '/approve-reject-reschedulebooking',
    adminAuth,
    approveRejectRescheduleBooking
)
adminRouter.post(
    '/delete-reschedulebooking',
    adminAuth,
    deleteBookingReSerequest
)
adminRouter.post('/edit-reschedulebooking', adminAuth, editReseduelBooking)

//#endregion
//#region addeditSpecialization
adminRouter.post('/add-edit-specialization', adminAuth, addEditSpecialization)
adminRouter.get('/get-all-specialization', adminAuth, getAllSpecialization)
// adminRouter.get(
//     '/get-all-specialization-list',
//     adminAuth,
//     getAllSpecializationList
// )
adminRouter.get(
    '/get-single-specialization',
    adminAuth,
    getsingleSpecialization
)
adminRouter.delete('/remove-specialization', adminAuth, removeSpecialization)

//#endregion
//#region rating and review

// adminRouter.get('/get-rating-and-review-expert', adminAuth, getRatingAndReviewExpert)
// adminRouter.delete(
//     '/remove-rating-and-review',
//     adminAuth,
//     removeRatingAndReview
// )
// adminRouter.patch(
//     '/rating-active-deactive',
//     adminAuth,
//     ratingActiveDeActiveStatus
// )
adminRouter.get('/get-all-rating-and-review', adminAuth, getAllRatingAndReview)
adminRouter.get(
    '/get-rating-and-review-by-id',
    adminAuth,
    getRatingAndReviewById
)
adminRouter.patch(
    '/approve-reject-rating-and-review',
    adminAuth,
    approveRejectRatingAndReview
)

//#endregion
//#region serviceProductList
adminRouter.post(
    '/add-edit-service-product-list',
    adminAuth,
    upload(allUploadsDir.product).fields([
        { name: 'productImage', maxCount: 10 },
    ]),
    addEditServicesProductList
)
adminRouter.get('/get-all-service-product', adminAuth, getAllServiceProductList)
adminRouter.get(
    '/get-single-service-product',
    adminAuth,
    getSingleServiceProductList
)
adminRouter.delete(
    '/remove-service-product',
    adminAuth,
    removeServiceProductList
)

//#endregion

//#region Setting

adminRouter.post('/admin-settings', adminAuth, adminSettings)
adminRouter.get('/get-settings', adminAuth, getSettings)
adminRouter.post('/add-about-us', adminAuth, addeditAboutUs)

//#endregion

//#region Chat
adminRouter.get('/get-admin-roomid-list', adminAuth, getAdminRoomIdList)
//#endregion

//#region Transaction
adminRouter.get(
    '/get-all-transaction-history',
    adminAuth,
    getAllTransactionHistory
)
adminRouter.get(
    '/get-single-transaction-history',
    adminAuth,
    getSingleTransactionHistory
)

//#endregion
//#region Refund
adminRouter.get('/get-all-refund', adminAuth, getAllRefund)
adminRouter.get('/get-single-refund', adminAuth, getSingleRefund)
adminRouter.get('/export-refund-data', adminAuth, refundListingsToCSVExport)
adminRouter.post('/remove-refund', adminAuth, removeRefund)
//#endregion

//#region Order
adminRouter.get('/get-all-order', adminAuth, getAllOrderList)
adminRouter.get('/order-details', adminAuth, getSingleOrder)
adminRouter.post('/update-order-status', adminAuth, updateOrderStatus)
adminRouter.post('/add-shipping-details', adminAuth, addShippingDetails)

//#region Return
adminRouter.post(
    '/update-order-return-status',
    adminAuth,
    updateReturnOrderStatus
)
adminRouter.post('/reassign-expert', adminAuth, reassignExpert)
adminRouter.get('/get-all-return-order', adminAuth, getAllReturnOrder)
adminRouter.get('/get-return-order', adminAuth, getReturnOrderById)
adminRouter.post(
    '/order-retun-refund-approve-reject',
    adminAuth,
    orderRefundApproveRejectByAdmin
)
//#endregion

export default adminRouter
