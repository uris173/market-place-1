const {Schema, model} = require('mongoose')

const product = new Schema({
  title: String,
  price: Number,
  description: String,
  material: String,
  status: {
    type: Number,
    default: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  details: [{
    color: String,
    size: [String],
    img: [String],
    detailStatus: {
      type: Number,
      default: 0
    }
  }]
})

module.exports = model('Product', product)