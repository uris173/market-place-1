const Router = require('express')
const router = Router()
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')


// REQUIRE CONTROLLERS
const { auth, login, logout } = require('../controllers/auth')
const { getHome } = require('../controllers/route')
const { categoryPage, categoryAdd, categoryChange, categorySave, categoryDelete } = require('../controllers/category')
const { subcategoryPage, subcategoryAdd, subcategoryChange, subcategorySave,subcategoryDelete } = require('../controllers/suncategory')
const { productPage, productCategoryId, productAdd, productDetailsApi, productDetailsAdd, productChange, productSave, productDelete, productInfoPage,productDetailsGet, productDetailsSave, productDetailsDelete } = require('../controllers/product')


// BEGINING AUTH ROUTER
router.get('/auth', auth)
router.post('/auth/login', login)
router.get('/auth/logout', logout)
// END AUTH ROUTER


// BIGINING MAIN ROUTER
router.get('/', authMiddleware, getHome)
// END MAIN ROUTER


// BEGINING CATEGORY ROUTER
router.get('/category', authMiddleware, categoryPage)
router.post('/category/add', authMiddleware, upload.single('img'), categoryAdd)
router.get('/category/change/:id', authMiddleware, categoryChange)
router.post('/category/save', authMiddleware, upload.single('img'), categorySave)
router.get('/category/delete/:id', authMiddleware, categoryDelete)
// END CATEGORY ROUTER


// BEGINING SUBCATEGORY ROUTER
router.get('/subcategory', authMiddleware, subcategoryPage)
router.post('/subcategory/add', authMiddleware, subcategoryAdd)
router.get('/subcategory/change/:id', authMiddleware, subcategoryChange)
router.post('/subcategory/save', authMiddleware, subcategorySave)
router.get('/subcategory/delete/:id', authMiddleware, subcategoryDelete)
// END SUBCATEGORY ROUTER


// BEGINING PRODUCT ROUTER
// product page
router.get('/product', authMiddleware, productPage)
router.get('/product/category/:id', authMiddleware, productCategoryId)
router.post('/product/add', authMiddleware, productAdd)
router.get('/product/details/:id', authMiddleware, productDetailsApi)
router.post('/product/add/details', authMiddleware, upload.fields([{name: 'img', maxCount: 4}]), productDetailsAdd)
router.get('/product/change/:id', authMiddleware, productChange)
router.post('/product/save', authMiddleware, productSave)
router.get('/product/delete/:id', authMiddleware, productDelete)
// product info page
router.get('/product/info/:id', authMiddleware, productInfoPage)
router.get('/product/details/:id/:index', authMiddleware, productDetailsGet)
router.post('/product/info/save/details', authMiddleware, upload.fields([{name: 'img', maxCount: 4}]), productDetailsSave)
router.get('/product/details/delete/:id/:index', authMiddleware, productDetailsDelete)

// END PRODUCT ROUTER


module.exports = router