const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    title: { type: "string", required: true },
    content: { type: "string", required: true },
    photoPath: { type: "string", required: true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model("Blog", blogSchema, "blogs");
module.exports = model;
