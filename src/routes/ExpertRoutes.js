import router from 'express'
const expertRouter = router()
import { getRatingAndReviewExpert } from '../controller/User/RatingAndReview.js'

import { getExpertDetails } from '../controller/Expert/ExpertController.js'
import { expertAuth } from '../middleware/Auth.js'
import {
    getAllBookingExpert,
    getMyAllrescheduleBooking,
    getMyrescheduleBooking,
    getUpcomingAndCompletedBooking,
    bookingReschedule,
    totalBookingByExpert,
    totalEarningsByExpert,
    getSingleBooking,
} from '../controller/User/BookingController.js'
import upload from '../middleware/FileUpload.js'
import { allUploadsDir } from '../utils/unLinkFile.js'
import { addEditExpert } from '../controller/Admin/ExpertController.js'
import { getExpertChatBookingWiseList } from '../controller/Common/CommonController.js'
import {
    addQuotations,
    editPlaceOrder,
    getQuotationsByExpert,
    getSingleQuotation,
    // getSingleQuotationsByExpert,
} from '../controller/User/CartController.js'
import {
    getAssignReturnOrder,
    getReturnOrderById,
    ReturnOrderupdateByExpert,
} from '../controller/User/ReturnOrderController.js'

//#region expert rating and review
expertRouter.get(
    '/get-expert-rating-and-review',
    expertAuth,
    getRatingAndReviewExpert
)
//#endregion

//#region expert profile
expertRouter.patch(
    '/add-edit-expert-profile',
    expertAuth,
    upload(allUploadsDir.expert).fields([
        { name: 'image', maxCount: 1 },
        { name: 'design', maxCount: 10 },
    ]),
    addEditExpert
)
expertRouter.get('/get-expert-details', expertAuth, getExpertDetails)
//#endregion

//#region expert booking
expertRouter.get(
    '/get-upcoming-and-completed-booking',
    expertAuth,
    getUpcomingAndCompletedBooking
)
expertRouter.get('/get-all-bookings-expert', expertAuth, getAllBookingExpert)
expertRouter.get('/get-single-booking', expertAuth, getSingleBooking)
expertRouter.get('/total-earnings-by-expert', expertAuth, totalEarningsByExpert)
expertRouter.get('/total-bookings-by-expert', expertAuth, totalBookingByExpert)
expertRouter.post('/booking-reschedule', expertAuth, bookingReschedule)
expertRouter.get(
    '/get-reschedulebooking-by-expert',
    expertAuth,
    getMyrescheduleBooking
)
expertRouter.get(
    '/get-all-reschedulebooking-by-expert',
    expertAuth,
    getMyAllrescheduleBooking
)
//#endregion

//#region expert chat
expertRouter.get(
    '/get-expert-chat-booking-wise',
    expertAuth,
    getExpertChatBookingWiseList
)
//#endregion

//#region expert order & quotations
expertRouter.patch('/edit-place-order', expertAuth, editPlaceOrder)
expertRouter.post(
    '/add-quotations',
    expertAuth,
    upload(allUploadsDir.quotation).fields([{ name: 'image', maxCount: 2 }]),
    addQuotations
)
expertRouter.get('/get-quotations-by-expert', expertAuth, getQuotationsByExpert)
// expertRouter.get('/get-single-quotations-by-expert', expertAuth, getSingleQuotationsByExpert)
expertRouter.get('/get-quotations', expertAuth, getSingleQuotation)

expertRouter.get('/get-assign-return-order', expertAuth, getAssignReturnOrder)
expertRouter.get('/get-return-order', expertAuth, getReturnOrderById)

expertRouter.post(
    '/review-return-order',
    expertAuth,
    upload(allUploadsDir.other).fields([{ name: 'image', maxCount: 2 }]),
    ReturnOrderupdateByExpert
)
//#endregion

export default expertRouter
