import router from 'express'
import {
    getAllSpecialization,
    getCmsDetails,
} from '../controller/Admin/AdminController.js'
import { getRatingAndReviewExpert } from '../controller/User/RatingAndReview.js'
import { applyPartner } from '../controller/Admin/PartnerController.js'
import { getAllBanner } from '../controller/Admin/BannerController.js'
import {
    getAllStitchingCategory,
    getAllStitchingSuperCategory,
    getAllStitchingSuperCategorybyServiceId,
    getAllSubCategory,
    getAllSubCategoryByCategoryId,
    getCategoryBySuperCategoryId,
    getSingleStitchingCategory,
    getSingleStitchingSuperCategory,
    getSubCategoryByCategoryId,
    getSubCategoryById,
} from '../controller/Admin/CategoryController.js'
import {
    getAboutUs,
    getAllCityOfSpecificStates,
    getAllCountries,
    getAllStatesOfSpecificCountry,
} from '../controller/Common/CommonController.js'
import { getAllExperts } from '../controller/Admin/ExpertController.js'
import {
    getAllActiveDiscountAndOffer,
    getAllService,
    getSingleService,
} from '../controller/Admin/ProductController.js'
import {
    customizeProduct,
    getAllServiceProductList,
    getAllServiceProductListBySubCategory,
    getSingleServiceProductList,
} from '../controller/Admin/ServicesProductListController.js'
import upload from '../middleware/FileUpload.js'
import { allUploadsDir } from '../utils/unLinkFile.js'
import { singleChatUploadMedia } from '../services/Socket.js'

// import {
//     order,
//     paymentVerification,
// } from '../controller/Admin/razorpayController.js'

const commonRouter = router()

commonRouter.get('/get-cms', getCmsDetails)
commonRouter.get('/get-rating-and-review-expert', getRatingAndReviewExpert)
commonRouter.post('/apply-partner', applyPartner)
commonRouter.get('/get-all-banner', getAllBanner)
commonRouter.get(
    '/get-all-active-discount-and-offer',
    getAllActiveDiscountAndOffer
)

//#region Paymant

// commonRouter.post('/payment-verification', paymentVerification)
// commonRouter.post('/order', order)

//#serviceCategory
commonRouter.get('/get-all-service', getAllService)
commonRouter.get('/get-single-service', getSingleService)

//#superCategory
commonRouter.get(
    '/get-all-stitching-super-category',
    getAllStitchingSuperCategory
)
commonRouter.get(
    '/get-single-stitching-super-category',
    getSingleStitchingSuperCategory
)
//#Category
commonRouter.get('/get-all-stitching-category', getAllStitchingCategory)
commonRouter.get('/get-single-stitching-category', getSingleStitchingCategory)

commonRouter.get(
    '/get-all-stitching-super-category-by-service-id',
    getAllStitchingSuperCategorybyServiceId
)
commonRouter.get(
    '/get-subcategory-by-category-id',
    getAllSubCategoryByCategoryId
)

//#subCategory
commonRouter.get('/get-all-subcategory', getAllSubCategory)
commonRouter.get('/get-single-subcategory-by-id', getSubCategoryById)
commonRouter.get(
    '/get-category-by-super-category-id',
    getCategoryBySuperCategoryId
)
commonRouter.get('/get-subcategory-by-category-id', getSubCategoryByCategoryId)

commonRouter.get('/get-all-countries', getAllCountries)
commonRouter.get(
    '/get-states-of-specific-country',
    getAllStatesOfSpecificCountry
)
commonRouter.get('/get-city-of-specific-states', getAllCityOfSpecificStates)

commonRouter.get('/get-all-service-product', getAllServiceProductList)
commonRouter.get('/get-single-service-product', getSingleServiceProductList)
commonRouter.post(
    '/custmize-product',
    upload(allUploadsDir.customize).fields([
        { name: 'customize', maxCount: 2 },
    ]),
    customizeProduct
)

commonRouter.get(
    '/get-all-service-product-by-sub-category',
    getAllServiceProductListBySubCategory
)

commonRouter.get('/get-all-specialization', getAllSpecialization)
commonRouter.get('/get-all-expert', getAllExperts)

commonRouter.get('/get-about-us', getAboutUs)

commonRouter.post(
    '/chat-upload-image',
    upload(allUploadsDir.chatImage).fields([
        { name: 'chatImage', maxCount: 5 },
    ]),
    singleChatUploadMedia
)

export default commonRouter
