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
// // giải thích tại sao dùng parent_id: và // Dữ liệu thật trong MongoDB sẽ trông như này:
// { _id: "A", name: "Laptop",     parent_id: null }   // không có cha -> là danh mục gốc
// { _id: "B", name: "Linh kiện",  parent_id: null }   // cũng là danh mục gốc
// { _id: "C", name: "RAM",        parent_id: "B" }    // cha là "B" (Linh kiện)
// { _id: "D", name: "SSD",        parent_id: "B" }    // cha cũng là "B" (Linh kiện)