const Category = require('../models/category')
const Subcategory = require('../models/subcategory')
const Product = require('../models/product')
const fs = require('fs')
const { exec } = require('child_process')


// PRODUCT PAGE CONTROLLERS

const productPage = async(req, res) =>{
  try {
    const perPage = 10
    const total = await Product.find().count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / perPage)}, (v, idx) =>{
      return {
        queryNum: idx,
        num: idx + 1
      }
    })
    pages = pages.map(page =>{
      page.class = page.queryNum == pageNum ? 'active' : ''
      return page
    })
    const category = await Category.find().where({status: 1}).lean()
    const subcategory = await Subcategory.find().where({status: 1}).lean()
    let product = await Product.find()
    .sort({_id: -1})
    .skip(pageNum * perPage)
    .limit(perPage)
    .populate([
      {path: 'subcategory', select: 'title'},
      {path: 'category', select: 'title'},
    ])
    .lean()
    if(req.query.search){
      // const value = req.query.search
      // const regex = new RegExp(escapeRegex(req.query.search))
      // product = await Product.find({
      //   $or: [
      //     {title: regex}, {subcategory: regex}
      //   ]
      // })
      const regex = new RegExp(escapeRegex(req.query.search), "i")
      Product.find({
        $or: [
          // {
          //   _id: new ObjectId(req.query.search)
          // },
          {
            title: {$regex: regex}
          },
          {
            "category.title": {$regex: regex}
          },
          {
            "subcategory.title": {$regex: regex}
          }
        ]
      })
      .populate([
        {path: 'subcategory', match: {'title': 'title'}, select: 'title'},
        {path: 'category', match: {'title': 'title'}, select: 'title'},
      ])
      .lean()
      .exec()
      console.log(product);
    }
    product = product.map((product, index) =>{
      product.class = product.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      product.status = product.status == 0 ? 'Отключенный' : 'Активный'
      product.index = index + 1
      return product
    })
    res.render('pages/product', {
      category, subcategory, product, pages,
      error: req.flash('error'),
      success: req.flash('success')
    })
  } catch (error) {
    console.log(error);
  }
}

const productCategoryId = async(req, res) =>{
  try {
    const _id = req.params.id
    const subcategory = await Subcategory.find({category: _id})
    .where({status: 1})
    res.send(subcategory)
  } catch (error) {
    res.send(error)
  }
}

const productAdd = async(req, res) =>{
  try {
    const {category, subcategory, price, title, description, material, status} = req.body
    const data = {category, subcategory, price, title, description, material, status}
    const product = new Product(data)
    await product.save()
    req.flash('success', 'Продукт успешно добавлен!')
    res.redirect('/product')
  } catch (error) {
    console.log(error);
  }
}

const productDetailsApi = async(req, res) =>{
  try {
    const _id = req.params.id
    const product = await Product.findOne({_id})
    res.send(product)
  } catch (error) {
    res.send(error)
  }
}

const productDetailsAdd = async(req, res) =>{
  try {
    const _id = req.body._id
    const {color, size, detailStatus} = req.body
    let {img} = req.files
    let image = []
    if(img){
      img.forEach(elements =>{
        image.push(elements.path)
      })
    }
    const product = await Product.findOne({_id})
    product.details.push({img: image, color, size, detailStatus})
    await Product.findByIdAndUpdate({_id}, product).lean()
    req.flash('success', 'Данные добавлены!')
    res.redirect('/product')
  } catch (error) {
    console.log(error);
  }
}

const productChange = async(req, res) =>{
  try {
    const _id = req.params.id
    const product = await Product.findOne({_id})
    .populate([
      {path: 'subcategory', select: 'title'},
      {path: 'category', select: 'title'},
    ])
    .lean()
    res.send(product)
  } catch (error) {
    res.send(error)
  }
}

const productSave = async(req, res) =>{
  try {
    const _id = req.body._id
    const {category, subcategory, title, price, material, description} = req.body
    const data = {category, subcategory, title, price, material, description}
    await Product.findByIdAndUpdate({_id}, data)
    req.flash('success', 'Прдутк успешно изменен!')
    res.redirect('/product')
  } catch (error) {
    console.log(error);
  }
}

const productDelete = async(req, res) =>{
  try {
    const _id = req.params.id
    let product = await Product.findById({_id})
    product.details.forEach(details =>{
      details.img.forEach(images =>{
        if(fs.existsSync(images)){
          fs.unlinkSync(images)
        }
        if(images.length > 0){
          if(fs.existsSync(images)){
            fs.unlinkSync(images)
          }
        }
      })
    })
    await Product.findByIdAndDelete({_id})
    req.flash('success', 'Удалено!')
    res.redirect('/product')
  } catch (error) {
    console.log(error);
  }
}


// PRODUCT INFO PAGE CONTROLLERS

const productInfoPage = async(req, res) =>{
  try {
    const _id = req.params.id
    let product = await Product.findOne({_id})
    .populate([
      {path: 'category', select: 'title'},
      {path: 'subcategory', select: 'title'}
    ])
    .lean()
    let mainImage = ''
    let firstImages = ''
    if(product.details.length > 0){
      mainImage = product.details[0].img[0]
      firstImages = product.details[0]
    }
    let inside = product.details.map((detail, index) =>{
      detail.class = detail.detailStatus == 0 ? 'badge bg-danger' : 'badge bg-success'
      detail.status = detail.detailStatus == 0 ? 'Отключенный' : 'Активный'
      detail.index = index + 1
      return detail
    })
    res.render('pages/product-info', {
      product, mainImage, firstImages, inside
    })
  } catch (error) {
    console.log(error);
  }
}

const productDetailsGet = async(req, res) =>{
  try {
    const _id = req.params.id
    const index = req.params.index
    const product = await Product.findOne({_id})
    const fIndex = product.details[index]
    res.send(fIndex)
  } catch (error) {
    console.log(error);
  }
}

const productDetailsSave = async(req, res) =>{
  try {
    const _id = req.body._id
    const detailIndex = Number(req.body.index)
    let {color, size, detailStatus} = req.body
    let product = await Product.findById({_id})
    let image = []
    let {img} = req.files
    if(img){
      img.forEach(images =>{
        image.push(images.path)
      })
      product.details.forEach((details, index) =>{
        if(detailIndex == index){
          details.img.forEach(images =>{
            if(fs.existsSync(images)){
              fs.unlinkSync(images)
            }
          })
        }
      })
      product.details[detailIndex] = {color, size, detailStatus, img: image}
    } else{
      product.details[detailIndex].color = color
      product.details[detailIndex].size = size
      product.details[detailIndex].detailStatus = detailStatus || 0
    }
    await Product.findByIdAndUpdate({_id}, product).lean()
    res.redirect(`/product/info/${_id}`)
  } catch (error) {
    console.log(error);
  }
}

const productDetailsDelete = async(req, res) =>{
  try {
    const _id = req.params.id
    const detailIndex = req.params.index
    let product = await Product.findOne({_id})
    product.details.forEach((details, index) =>{
      if(detailIndex == index){
        details.img.forEach(images =>{
          if(fs.existsSync(images)){
            fs.unlinkSync(images)
          }
        })
      }
    })
    product.details.splice(detailIndex, 1)
    await Product.findByIdAndUpdate(_id, product)
    res.redirect(`/product/info/${_id}`)
  } catch (error) {
    console.log(error);
  }
}


function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = { productPage, productCategoryId, productAdd, productDetailsApi, productDetailsAdd, productChange, productSave, productDelete, productInfoPage, productDetailsGet, productDetailsSave, productDetailsDelete }