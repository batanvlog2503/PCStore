const mongoose = require("mongoose")
const { Schema } = mongoose

// Danh mục tự tham chiếu (parent_id) để làm danh mục cha/con
const CategorySchema = new Schema({
  parent_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  name: { type: String, required: true, maxlength: 255 },
  slug: { type: String, required: true, unique: true, maxlength: 255 },
})

CategorySchema.index({ parent_id: 1 })

module.exports = mongoose.model("Category", CategorySchema)