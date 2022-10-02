const {Schema, model} = require('mongoose')

const category = new Schema({
  title: String,
  slug: String,
  img: String,
  status: {
    type: Number,
    default: 0
  }
})

module.exports = model('Category', category)