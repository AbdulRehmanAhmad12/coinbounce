const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: { type: "string", required: true },
    blog: { type: mongoose.SchemaTypes.ObjectId, ref: 'blogs' },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model("Comment", commentSchema, "Comments");
module.exports = model;