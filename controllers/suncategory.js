const Subcategory = require('../models/subcategory')
const Category = require('../models/category')

const subcategoryPage = async(req, res) =>{
  try {
    const perPage = 10
    const total = await Subcategory.find().count()
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
    let category = await Category.find()
    .where({status: 1})
    .lean()
    let subcategory = await Subcategory.find()
    .sort({_id: -1})
    .skip(pageNum * perPage)
    .limit(perPage)
    .populate('category')
    .lean()
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search))
      subcategory = await Subcategory.find({
        $or: [
          {title: regex}, {slug: regex}, {
            "category.title": {$regex: regex}
          },
        ],
      })
      .populate({path: 'category', match: {title: {$regex: regex}}, select: 'title'},)
      .lean()
    }
    subcategory = subcategory.map((subcategory, index) =>{
      subcategory.class = subcategory.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      subcategory.status = (subcategory.status == 0) ? 'Отключенный' : 'Активный'
      subcategory.index = index + 1
      return subcategory
    })
    res.render('pages/subcategory', {
      subcategory, category, pages,
      success: req.flash('success'),
      error: req.flash('error'),
    })
  } catch (error) {
    console.log(error);
  }
}

const subcategoryAdd = async(req, res) =>{
  try {
    const {category, title, slug, status} = req.body
    const haveSubcategory = await Subcategory.findOne({
      $and: [
        {
          $or: [
            {'title': title},
            {'slug': slug}
          ]
        },
        {'category': category}
      ],
    })
    if(haveSubcategory){
      req.flash('error', 'Субкатегория с такими значениями уже существует!')
    } else{
      const subcategory = new Subcategory({category, title, slug, status})
      req.flash('success', 'Субкатегория успешно добавлен!')
      await subcategory.save()
    }
    res.redirect('/subcategory')
  } catch (error) {
    console.log(error);
  }
}

const subcategoryChange = async(req, res) =>{
  try {
    const _id = req.params.id
    const subcategory = await Subcategory.findOne({_id})
    res.send(subcategory)
  } catch (error) {
    res.send(error)
  }
}

const subcategorySave = async(req, res) =>{
  try {
    const _id = req.body._id
    const {category, title, slug, status} = req.body
    const haveSubcategory = await Subcategory.findOne({
      $and: [
        {
          $or: [
            {'title': title},
            {'slug': slug}
          ]
        }
      ],
      _id: {$nin: _id}
    })
    if(haveSubcategory){
      req.flash('error', 'Субкатегория с такими значениями уже существует!')
    } else{
      const subcategory = {category, title, slug, status: status || 0}
      await Subcategory.findByIdAndUpdate({_id}, subcategory).lean()
      req.flash('success', 'Субкатегория успешно изменен!')
    }
    res.redirect('/subcategory')
  } catch (error) {
    console.log(error);
  }
}

const subcategoryDelete = async(req, res) =>{
  try {
    const _id = req.params.id
    await Subcategory.findByIdAndDelete({_id})
    res.redirect('/subcategory')
  } catch (error) {
    console.log(error);
  }
}

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = { subcategoryPage, subcategoryAdd, subcategoryChange, subcategorySave, subcategoryDelete }