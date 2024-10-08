import { ResponseMessage } from '../../utils/ResponseMessage.js'
import { StatusCodes } from 'http-status-codes'
import rolepermission from '../../models/RolePermission.js'
import { handleErrorResponse } from '../../services/CommonService.js'
import Admin from '../../models/Admin.js'

export const addRole = async (req, res) => {
    try {
        let { role, permissions } = req.body
        const alreadyRole = await rolepermission.findOne({
            role: role,
            isDeleted: false,
        })
        if (alreadyRole) {
            return res.status(400).json({
                status: 400,
                message: ResponseMessage.ROLE_ALREADY_CREATED,
                data: [],
            })
        }
        let addRole = await new rolepermission({
            role,
            permissions,
        }).save()
        if (addRole) {
            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.ROLE_ADDED,
                data: addRole,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region editRole
export const editRole = async (req, res) => {
    try {
        let { id, role, permissions } = req.body

        const alreadyRole = await rolepermission.findOne({
            _id: { $ne: id },
            role: role,
            isDeleted: false,
        })
        if (alreadyRole) {
            return res.status(400).json({
                status: 400,
                message: ResponseMessage.ROLE_ALREADY_CREATED,
                data: [],
            })
        }

        let editRole = await rolepermission.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    role: role,
                    permissions: permissions,
                },
            },
            { new: true }
        )
        if (editRole) {
            return res.status(201).json({
                status: StatusCodes.CREATED,
                message: ResponseMessage.ROLE_UPDATED,
                data: editRole,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region removeRole
export const removeRole = async (req, res) => {
    try {
        let { id } = req.params
        let removeRole = await rolepermission
            .findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        isDeleted: true,
                    },
                },
                { new: true }
            )
            .lean()
        if (removeRole) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ROLE_REMOVED,
                data: removeRole,
            })
        } else {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.BAD_REQUEST,
                data: [],
            })
        }
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}
//#endregion

//#region getRole

export const getAllRole = async (req, res) => {
    try {
        const data = await rolepermission
            .find({
                isDeleted: false,
            })
            .select('role permissions isActive')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ALL_ROLE_FETCHED,
            data,
        })
    } catch (error) {
        return handleErrorResponse(res, error)
    }
}

export const getAllRoleWithName = async (req, res) => {
    try {
        let getAllRole = await rolepermission
            .find({ role: { $ne: 'Admin' }, isDeleted: false, isActive: true })
            .sort({ createdAt: -1 })
            .lean()
            .select('role')
        if (getAllRole) {
            return res.status(200).json({
                status: StatusCodes.OK,
                message: ResponseMessage.ALL_ROLE_FETCHED,
                data: getAllRole,
            })
        } else {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ROLE_LIST_NOT_FOUND,
                data: [],
            })
        }
    } catch (err) {
        return handleErrorResponse(res, err)
    }
}

//#endregion

//#region get role and permission data by admin ID
export const getRolePermissionsById = async (req, res) => {
    try {
        const adminId = req.admin

        const findAdmin = await Admin.findById(adminId).populate({
            path: 'roleId',
            select: ['permissions', 'Active', 'role'],
        })

        if (!findAdmin) {
            return res.status(404).json({
                status: StatusCodes.NOT_FOUND,
                message: ResponseMessage.ADMIN_NOT_FOUND,
                data: [],
            })
        }

        const { roleId } = findAdmin
        const { role, permissions, Active } = roleId

        res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ROLE_PERMISSIONS_FETCHED,
            data: {
                role,
                permissions,
                Active,
            },
        })
    } catch (error) {
        res.status(500).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            data: [],
        })
    }
}
//#endregion
