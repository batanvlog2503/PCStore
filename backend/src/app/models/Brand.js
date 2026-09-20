const mongoose = require("mongoose")
const { Schema } = mongoose

const BrandSchema = new Schema({
  name: { type: String, required: true, unique: true, maxlength: 255 },
  slug: { type: String, required: true, maxlength: 255, unique: true },
  logo_url: { type: String, maxlength: 500 },
})

module.exports = mongoose.model("Brand", BrandSchema)
