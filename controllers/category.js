const Category = require('../models/category')
const fs = require('fs')

const categoryPage = async(req, res) =>{
  try {
    let category = await Category.find()
    .sort({_id: -1})
    .lean()
    category = category.map((category, index) =>{
      category.class = category.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      category.status = (category.status == 0) ? 'Отключенный' : 'Активный'
      category.index = index + 1
      return category
    })
    res.render('pages/category', {
      category,
      error: req.flash('error'),
      success: req.flash('success'),
    })
  } catch (error) {
    console.log(error);
  }
}

const categoryAdd = async(req, res) =>{
  try {
    const {title, slug, status} = req.body
    const haveCategory = await Category.findOne({
      $and: [
        {
          $or: [
            {'title': title},
            {'slug': slug}
          ]
        }
      ]
    })
    if(haveCategory){
      req.flash('error', 'Категория с такими значениями уже существует!')
    } else{
      let img = ''
      if(req.file){
        img = req.file.path
      }
      const category = new Category({title, slug, img, status})
      await category.save()
      req.flash('success', 'Категория успешно добавлен!')
    }
    res.redirect('/category')
  } catch (error) {
    console.log(error);
  }
}

const categoryChange = async(req, res) =>{
  try {
    const _id = req.params.id
    const category = await Category.findOne({_id}).lean()
    res.send(category)
  } catch (error) {
    res.send(error)
  }
}

const categorySave = async(req, res) =>{
  try {
    const _id = req.body._id
    const {title, slug, status} = req.body
    const haveCategory = await Category.findOne({
      $and: [
        {
          $or: [
            {'title': title},
            {'slug': slug},
          ]
        }
      ],
      _id: {$nin: _id}
    })
    if(haveCategory){
      req.flash('error', 'Категория с такими значениями уже существует!')
    } else{
      let img = ''
      let category = await Category.findOne({_id}).lean()
      if(req.file){
        img = req.file.path
        if(fs.existsSync(category.img)){
          fs.unlinkSync(category.img)
        }
        category = {title, slug, img, status}
      } else{
        category = {title, slug, status: status || 0}
      }
      await Category.findByIdAndUpdate({_id}, category)
      req.flash('success', 'Категория успешно изменен!')
    }
    res.redirect('/category')
  } catch (error) {
    console.log(error);
  }
}

const categoryDelete = async(req, res) =>{
  try {
    const _id = req.params.id
    const category = await Category.findById({_id})
    if(fs.existsSync(category.img)){
      fs.unlinkSync(category.img)
    }
    await Category.findByIdAndDelete({_id})
    req.flash('success', 'Удалено!')
    res.redirect('/category')
  } catch (error) {
    console.log(error);
  }
}


module.exports = { categoryPage, categoryAdd, categoryChange, categorySave, categoryDelete }