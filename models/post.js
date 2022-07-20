const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Body: {
      type: String,
      required: true,
    },
    Photo: {
      type: Schema.Types.ObjectId,
      ref: "uploads.files",
    },
    PostedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    private :{
        type:Boolean,
        default:false
    },
    Likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    Comments: [
      {
        Text: String,
        PostedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
