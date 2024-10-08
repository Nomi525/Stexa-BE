import express from 'express'
import cors from 'cors'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

import dbConfig from './config/Db.config.js'
import userRouter from './routes/UserRoutes.js'
import commonRouter from './routes/CommonRoutes.js'
import adminRouter from './routes/AdminRoutes.js'
import expertRouter from './routes/ExpertRoutes.js'
import { Server, app } from './config/Socket.config.js'
import('./services/Socket.js')

// let PORT = 3048
const PORT = process.argv[2] || process.env.PORT || 5000

dbConfig()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.get('/api/images/:file', (req, res) => {
    const [folderName] = req.params.file.split('!')
    const fPath = process.cwd()
    fs.readFile(
        fPath + '/uploads/' + folderName + '/' + req.params.file,
        (err, data) => {
            if (err) {
                return
            }
            res.setHeader('Content-Type', 'image/png')
            res.send(data)
        }
    )
})

app.use('/api/user', userRouter)
app.use('/api', commonRouter)
app.use('/api/admin', adminRouter)
app.use('/api/expert', expertRouter)

Server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default { app }
// const Server = app
// export default Server
