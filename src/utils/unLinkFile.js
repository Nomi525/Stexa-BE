import fs, { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const allUploadsDir = {
    banner: 'banner',
    product: 'product',
    category: 'category',
    expert: 'expert',
    user: 'user',
    subcategory: 'subcategory',
    service: 'service',
    other: 'other',
    desgin: 'desgin',
    customize: 'customize',

    quotation: 'quotation',

    chatImage: 'chatImage',
}

const createAllFolder = (allUploadsDir) => {
    Object.values(allUploadsDir || {}).forEach((value) => {
        const directoryPath = join(process.cwd(), 'uploads', value)
        if (!existsSync(directoryPath)) {
            mkdirSync(directoryPath, { recursive: true })
        }
    })
}
createAllFolder(allUploadsDir)

export const unLinkFile = (path = '', file) => {
    const filePath = `${join(process.cwd(), 'uploads/', path)} /${file}`
    fs.unlink(filePath, (error) => {
        if (error) {
            return
        }
    })
}

export const mergeStringToArray = (args) => {
    return Array.isArray(args) ? args : [args]
}

export { allUploadsDir }
