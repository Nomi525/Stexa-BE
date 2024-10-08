const createExpertCsv = async function (record) {
    try {
        let csvContent = 'name,email,phoneNumber,grade,rating, review\n'
        record.map((data) => {
            csvContent += `${data.name},${data.email},${data.phoneNumber},${data.grade},${data.rating},${data.review}\n`
        })

        return csvContent
    } catch (error) {
        console.error(error)
        return ''
    }
}
const createBookingCsv = async function (record) {
    try {
        let csvContent =
            'Booking_Id,User_Name,User_Email,Address,Country,State,City,ZipCode,Booking_Time,Expert_Name,Type,Status\n'
        record.map((data) => {
            csvContent += `${data.bookingId},${data.userId.name},${data.email},${data.address},${data.country},${data.state},${data.city},${data.zipCode},${data.bookingDateTime},${data.expertId.name},${data.bookingType},${data.status}\n`
        })

        return csvContent
    } catch (error) {
        console.error(error)
        return ''
    }
}

const createRefundCsv = async function (record) {
    try {
        let csvContent =
            'Refund_Id,Order_Id,booking_Id,UserName,UserEmailAddress,ExpertName,Refund_Amount,Refund_Date,Status\n'
        record.map((data) => {
            csvContent += `${data.refundId},${data.orderId.orderId},${data.bookingId.bookingId},${data.userId.name},${data.userId.email},${data.expertId.name},${data.refundAmount},${data.createdAt},${data.status}\n`
        })

        return csvContent
    } catch (error) {
        console.error(error)
        return ''
    }
}

const createOfferCsv = async function (record) {
    try {
        let csvContent =
            'couponCode,discountType,discountValue,serviceProductType,maxUsageCount,startDate,endDate,status\n'
        record.map((data) => {
            csvContent += `${data.couponCode},${data.discountType},${data.discountValue},${data.serviceProductType},${data.maxUsageCount},${data.startDate},${data.endDate},${data.status}\n`
        })

        return csvContent
    } catch (error) {
        console.error(error)
        return ''
    }
}

const createBannerCsv = async function (record) {
    try {
        let csvContent = 'bannerName,description\n'
        record.map((data) => {
            csvContent += `${data.bannerName},${data.description}\n`
        })

        return csvContent
    } catch (error) {
        console.error(error)
        return ''
    }
}

export {
    createExpertCsv,
    createBannerCsv,
    createOfferCsv,
    createBookingCsv,
    createRefundCsv,
}
