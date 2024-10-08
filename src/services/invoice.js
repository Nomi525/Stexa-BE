import Order from '../models/PlaceOrder.js'
import StatusCodes from 'http-status-codes'
import { ResponseMessage } from '../utils/ResponseMessage.js'
import mongoose from 'mongoose'
import { generateInvoiceId, handleErrorResponse } from './CommonService.js'
import Quotation from '../models/Quotation.js'
import htmlPdf from 'html-pdf-node'
import Admin from '../models/Admin.js'

export const invoiceDownload = async (req, res) => {
    try {
        const findAdmin = await Admin.findOne({
            isAdmin: true,
            type: 'Admin',
        })
        const adminEmail = findAdmin ? findAdmin.email : null

        const existingOrder = await Order.findOne({
            _id: req.query.id,
        })
            .populate({
                path: 'userId expertId',
                select: 'name email phoneNumber address city state country zipCode',
            })
            .populate({
                path: 'bookingId',
                select: 'ServicesAndProducts totalPayAmount discount gst',
                populate: {
                    path: 'ServicesAndProducts.ServicesProductId',
                    select: 'name description productImage',
                },
            })
            .populate({
                path: 'bookingId.ServicesAndProducts',
                select: 'quantity price subTotal',
            })

        if (!existingOrder) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found',
            })
        }

        const fabricAmount = await Quotation.findOne({
            bookingId: existingOrder.bookingId._id,
        }).select('name fabricQuality fabricLength fabricAmount')

        let invoiceNum = await generateInvoiceId()
        const html = generateHTML(
            existingOrder,
            fabricAmount,
            invoiceNum,
            adminEmail
        )

        const options = {
            format: 'A4',
            landscape: false,
        }

        // Generate PDF from HTML
        const file = { content: html }

        try {
            const pdfBuffer = await htmlPdf.generatePdf(file, options)

            // Set headers to trigger file download
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=invoice${new Date().toLocaleDateString()}.pdf`
            )
            res.send(pdfBuffer)
        } catch (error) {
            console.error(
                'Error generating PDF:',
                error.response?.data || error.message
            )
            return res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
            })
        }
    } catch (error) {
        console.error('Error generating PDF:', error.message)
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        })
    }
}

// const generateHTML = (order, fabricAmount, invoiceNum,adminEmail) => {
//     // Destructure order and fabricAmount details
//     let { userId, expertId, bookingId, totalPartialPayAmount } = order
//     const { totalPayAmount, discount, ServicesAndProducts, gst } = bookingId
//     if (fabricAmount === null  || fabricAmount === 0 || fabricAmount === undefined) {
//         fabricTotal: 0
//     }
//     const {
//         fabricQuality,
//         fabricLength,
//         fabricAmount: fabricTotal,
//         name,
//     } = fabricAmount

const generateHTML = (order, fabricAmount, invoiceNum, adminEmail) => {
    // Destructure order details
    let { userId, expertId, bookingId, totalPartialPayAmount } = order
    const { totalPayAmount, discount, ServicesAndProducts, gst } = bookingId

    // Initialize fabricTotal to 0 if fabricAmount is null, 0, or undefined
    let fabricTotal = 0
    let fabricQuality, fabricLength, name

    if (fabricAmount && fabricAmount.fabricAmount) {
        fabricTotal = fabricAmount.fabricAmount
        ;({ fabricQuality, fabricLength, name } = fabricAmount)
    }

    // Calculate totals
    const quotationTotalAmount = totalPayAmount - discount + fabricTotal
    totalPartialPayAmount = totalPartialPayAmount
    const quotationPartialPendingAmount =
        quotationTotalAmount - totalPartialPayAmount

    // Generate HTML content
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

        <title>Invoice</title>
        <style>
            body {
                margin: 0;
                font-family: "Poppins", sans-serif;
                padding: 20px 0;
            }
            .vendorListHeading {
            background-color: #000;
            color: white;
            -webkit-print-color-adjust: exact;
        }
        </style>
    </head>
    <body style="background-color: #80808024;">
        <table style="width: 750px; background-color: #fff; margin: auto; padding: 20px; border: 3px solid #9e9e9e;">
            <tr>
                <td>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="width: 60%;">
                                <h5 style="font-size: 35px; font-family: 'Poppins', sans-serif; font-weight: 800;">RunTailors</h5>
                            </td>
                            <td style="width: 40%;">
                                 <h1 class="  vendorListHeading"
                                style="color: #fff; font-size: 35px; text-align: center; border-bottom-left-radius: 35px; padding: 15px 25px; width: max-content; float: right;font-family: 'Poppins', sans-serif;">
                                Invoice</h1>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table style="width: 100%;">
                        <tr>
                            <td style="width: 60%;">
                                <h3 style="margin: 0; font-weight: 700; padding-bottom: 5px; font-family: 'Poppins', sans-serif;">${userId.name}</h3>
                                <p style="margin: 0 0 10px; font-size: 14px; max-width: 200px; font-family: 'Poppins', sans-serif;">${userId.address || ''}</p>
                                <p style="margin: 0 0 10px; font-size: 14px; max-width: 200px; font-family: 'Poppins', sans-serif;">${userId.city || ''} ${userId.state || ''} ${userId.country || ''} ${userId.zipCode || ''}</p>
                                <p style="margin: 0 0 10px; font-size: 14px; max-width: 200px; font-family: 'Poppins', sans-serif;">Phone Number: ${userId.phoneNumber || ''}</p>
                            </td>
                            <td style="width: 20%;">
                                <p style="text-align: right; margin: 0; padding-bottom: 5px; font-family: 'Poppins', sans-serif; font-weight: 700;">${invoiceNum}</p>
                                <p style="text-align: right; margin: 0; padding-bottom: 5px; font-weight: 700;">Date: ${new Date().toLocaleDateString()}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table style="border: 1px solid #000; width: 100%; border-collapse: collapse;">
                        <tr style="text-align: center; background-color: #8080801f;">
                            <th style="width: 10%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0;">No.</th>
                            <th style="width: 30%; border-right: 1px solid #000; border-bottom: 1px solid #000">Item Description</th>
                            <th style="width: 20%; border-right: 1px solid #000; border-bottom: 1px solid #000">Qty</th>
                            <th style="width: 20%; border-right: 1px solid #000; border-bottom: 1px solid #000">Price</th>
                            <th style="width: 20%; border-bottom: 1px solid #000">Total</th>
                        </tr>
                        ${ServicesAndProducts.map(
                            (product, index) => `
                        <tr style="text-align: center;">
                            <td style="padding: 10px 0; border-right: 1px solid #000; border-bottom: 1px solid #000;">${index + 1}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${product.ServicesProductId.name}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${product.quantity}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${product.price}</td>
                            <td style="border-bottom: 1px solid #000;">${product.subTotal}</td>
                        </tr>`
                        ).join('')}
                        <tr style="text-align: center;">
                        <td style="padding: 10px 0; border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">Fabric: ${name}</td>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${fabricTotal}</td>
                        <td style="border-bottom: 1px solid #000;">${fabricTotal}</td>
                    </tr>
                        <tr>
                            <td colspan="4" style="font-weight: 700; color: #000000; padding: 5px; text-align: start; border-bottom: 1px solid #000; border-right: 1px solid #000;">Discount</td>
                            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #000;">${discount}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="font-weight: 700; color: #000000; padding: 5px; text-align: start; border-bottom: 1px solid #000; border-right: 1px solid #000;">GST 18%</td>
                            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #000;">${gst || ''}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="font-weight: 700; color: #000000; padding: 5px; text-align: start; border-bottom: 1px solid #000; border-right: 1px solid #000;">Paid Amount</td>
                            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #000;">${totalPartialPayAmount}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="font-weight: 700; color: #000000; padding: 5px; text-align: start; border-bottom: 1px solid #000; border-right: 1px solid #000;">Pending Amount</td>
                            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #000;">${quotationPartialPendingAmount}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="font-weight: 700; color: #000000; padding: 5px; text-align: start; border-bottom: 1px solid #000; border-right: 1px solid #000;">Sub Total</td>
                            <td style="text-align: center; padding: 5px; border-bottom: 1px solid #000;">${quotationTotalAmount}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align: start; padding-top: 30px;">
                    <h3 style="margin-bottom: 5px; margin-top: 0; padding: 0; font-weight: 700; font-family: 'Poppins', sans-serif; font-size: 15px;">Contact Info:</h3>
                    <p style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; font-size: 14px;">Email Id: ${adminEmail}</p>
                    <h4>Thank you for Your Purchase</h4>
                </td>
            </tr>
            <tr>
                <td style="text-align: center">
                    <h6 style="margin-bottom: 0;">© 2024 Stexa • All Rights Reserved</h6>
                </td>
            </tr>
        </table>
    </body>
    </html>`
}
