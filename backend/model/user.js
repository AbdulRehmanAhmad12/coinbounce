const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: "string", required: true },
    username: { type: "string", required: true },
    email: { type: "string", required: true },
    password: { type: "string", required: true },
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model("User", userSchema, "Users");
module.exports = model;
