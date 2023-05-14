const mongoose = require("mongoose");

const { Schema } = mongoose;

const refreshTokenSchema = new Schema(
  {
    token: { type: "string", required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "users"},
  },
  { timeStamp: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema, "tokens");
