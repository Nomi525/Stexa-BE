import StatusCodes from 'http-status-codes'
import { ResponseMessage } from '../../utils/ResponseMessage.js'

import Category from '../../models/Category.js'
import { handleErrorResponse } from '../../services/CommonService.js'
import SubCategory from '../../models/SubCategory.js'
import SuperCategory from '../../models/SuperCategory.js'

////// # SUPER CATEGORY #//////

//#region addEditCategory
export const addEditSuperCategory = async (req, res) => {
    try {
        const { name, description, id, serviceId } = req.body

        if (req.file) {
            req.body.image = req.file.filename
        }

        if (id) {
            const exist = await SuperCategory.findById({ _id: id })

            let update = await SuperCategory.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        name: name ? name : exist.name,
                        description,
                        image: req.body.image,
                        serviceId,
                    },
                },
                { new: true }
            )
            if (update) {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.CATEGORY_UPDATED,
                    data: update,
                })
            } else {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                })
            }
        } else {
            const exist = await SuperCategory.findOne({
                name,
            })

            if (exist) {
                const alreadycatagoryName = await SuperCategory.findOne({
                    name,
                    _id: { $ne: exist._id },
                    isDeleted: false,
                })
                if (alreadycatagoryName) {
                    return res.status(400).json({
                        status: StatusCodes.BAD_REQUEST,
                        message: ResponseMessage.CATEGORYNAME_EXIST,
                        data: [],
                    })
                }
            }
            let add = await new SuperCategory({
                name,
                description,
                image: req.body.image,
                serviceId,
            })
            await add.save().then(() => {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.CATEGORY_ADDED,
                    data: add,
                })
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#region Get All Category

export const getAllStitchingSuperCategory = async (req, res) => {
    try {
        const data = await SuperCategory.find({
            isDeleted: false,
        })
            .select('name image description isActive serviceId')
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ALL_CATEGORIES,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getAllStitchingSuperCategorybyServiceId = async (req, res) => {
    try {
        const data = await SuperCategory.find({
            serviceId: req.query.id,
            isDeleted: false,
        }).sort({
            createdAt: -1,
        })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ALL_CATEGORIES,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const getSingleStitchingSuperCategory = async (req, res) => {
    try {
        const { id } = req.query

        const data = await SuperCategory.findById({ _id: id })

        return res.status(200).json({
            message: ResponseMessage.CATEGORY_DETAILS,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const removeStitchingSuperCategory = async (req, res) => {
    try {
        const { id } = req.query
        const remove = await SuperCategory.findByIdAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } }
        )
        if (remove) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.CATEGORY_REMOVED,
                data: remove,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

////// # CATEGORY #//////
//#region addEditCategory
export const addEditCategory = async (req, res) => {
    try {
        const { name, description, id, superCategoryId } = req.body

        if (req.file) {
            req.body.image = req.file.filename
        }

        if (id) {
            let update = await Category.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        name,
                        description,
                        superCategoryId,
                        image: req.body.image,
                    },
                },
                { new: true }
            )
            if (update) {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.CATEGORY_UPDATED,
                    data: update,
                })
            } else {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                })
            }
        } else {
            const exist = await Category.findOne({
                name,
                superCategoryId,
            })

            if (exist) {
                const alreadycatagoryName = await Category.findOne({
                    name,
                    _id: { $ne: exist._id },
                    isDeleted: false,
                })
                if (alreadycatagoryName) {
                    return res.status(400).json({
                        status: StatusCodes.BAD_REQUEST,
                        message: ResponseMessage.CATEGORYNAME_EXIST,
                        data: [],
                    })
                }
            }
            let add = await new Category({
                name,
                description,
                superCategoryId,
                image: req.body.image,
            })
            await add.save().then(() => {
                return res.status(200).json({
                    status: StatusCodes.OK,
                    message: ResponseMessage.CATEGORY_ADDED,
                    data: add,
                })
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#region Get All Category

export const getAllStitchingCategory = async (req, res) => {
    try {
        const data = await Category.find({
            isDeleted: false,
        })
            .select('name description image superCategoryId')
            .populate({ path: 'superCategoryId', select: 'name' })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ALL_CATEGORIES,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const getSingleStitchingCategory = async (req, res) => {
    try {
        const { id } = req.query
        const data = await Category.findById({ _id: id, isDeleted: false })
        return res.status(200).json({
            message: ResponseMessage.CATEGORY_DETAILS,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const removeCategory = async (req, res) => {
    try {
        const { id } = req.query
        const remove = await Category.findByIdAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } }
        )
        if (remove) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.CATEGORY_REMOVED,
                data: [],
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getCategoryBySuperCategoryId = async (req, res) => {
    try {
        const { id } = req.query

        const data = await Category.find({
            superCategoryId: id,
            isDeleted: false,
        }).populate({
            path: 'superCategoryId',
            select: 'name',
        })
        return res.status(200).json({
            message: ResponseMessage.SUB_CATEGORY_BY_CATEGORY,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

////// # SUB CATEGORY #//////

export const addEditSubCategory = async (req, res) => {
    try {
        const { name, description, id, categoryId, superCategoryId } = req.body
        const imageFilename = req.file ? req.file.filename : undefined

        // Check if subcategory name already exists
        const existingSubCategory = await SubCategory.findOne({
            name,
            categoryId,
            superCategoryId,
        })

        if (
            existingSubCategory &&
            (!id || existingSubCategory._id.toString() !== id)
        ) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.SUB_CATEGORYNAME_EXIST,
                data: [],
            })
        }

        let subCategory
        if (id) {
            subCategory = await SubCategory.findByIdAndUpdate(id, {
                name,
                description,
                image: imageFilename,
                categoryId,
                superCategoryId,
            })
        } else {
            subCategory = new SubCategory({
                name,
                description,
                image: imageFilename,
                categoryId,
                superCategoryId,
            })
            await subCategory.save()
        }

        if (subCategory) {
            const message = id
                ? ResponseMessage.SUB_CATEGORY_UPDATED
                : ResponseMessage.SUB_CATEGORY_ADDED
            return res.status(200).json({
                status: StatusCodes.OK,
                message,
                data: subCategory,
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

export const getAllSubCategory = async (req, res) => {
    try {
        const data = await SubCategory.find({ isDeleted: false })
            .populate('categoryId superCategoryId', 'name description image')
            .select('name description image categoryId superCategoryId')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ALL_SUB_CATEGORIES,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getAllSubCategoryByCategoryId = async (req, res) => {
    try {
        const { id } = req.query
        const data = await SubCategory.find({
            categoryId: id,
            isDeleted: false,
        }).sort({
            createdAt: -1,
        })
        return res
            .status(200)
            .json({
                message: ResponseMessage.SUB_CATEGORY_BY_CATEGORY,
                data,
            })
            .sort({ createdAt: -1 })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
export const getSubCategoryById = async (req, res) => {
    try {
        const { id } = req.query
        const data = await SubCategory.findById({ _id: id }).sort({
            createdAt: -1,
        })
        return res.status(200).json({
            message: ResponseMessage.SUB_CATEGORY_DETAILS,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const removeSubCategory = async (req, res) => {
    try {
        const { id } = req.query
        const remove = await SubCategory.findByIdAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } }
        )
        if (remove) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.SUB_CATEGORY_REMOVED,
                data: [],
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const getSubCategoryByCategoryId = async (req, res) => {
    try {
        const { id } = req.query
        const data = await SubCategory.find({
            categoryId: id,
            isDeleted: false,
        })
        return res.status(200).json({
            message: ResponseMessage.SUB_CATEGORY_BY_CATEGORY,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const SubCategoryActiveDeactiveStatus = async (req, res) => {
    try {
        const subcategory = await SubCategory.findOne({ _id: req.query.id })

        if (!subcategory) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.SUBCATEGORY_NOT_FOUND,
            })
        } else {
            // Toggle active status
            const newActiveStatus = !subcategory.isActive

            const updatedSubcategory = await SubCategory.updateOne(
                { _id: req.body.id },
                { $set: { isActive: newActiveStatus } },
                { new: true }
            )

            return res.status(200).json({
                status: StatusCodes.OK,
                message: !newActiveStatus
                    ? ResponseMessage.SUBCATEGORY_DEACTIVE
                    : ResponseMessage.SUBCATEGORY_ACTIVE,
                data: updatedSubcategory,
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
        })
    }
}
