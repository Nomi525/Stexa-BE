import multer from 'multer'

const getStorage = (path = '') => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `uploads/${path ? path + '/' : ''}`)
        },
        filename: (req, file, cb) => {
            cb(null, path + '!' + Date.now() + '-' + file.originalname)
        },
    })
}

const upload = (path) => {
    return multer({ storage: getStorage(path) })
}
export default upload
