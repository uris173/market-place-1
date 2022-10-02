const Router = require('express')
const router = Router()

// require routers
const routePage = require('./router/route')


// use routers
router.use(routePage)


module.exports = router