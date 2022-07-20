const controller = require("../controllers/post");
const express = require("express");
const auth = require("../middlewares/auth");
const crypto = require("crypto");
const path = require("path");

const Post = require("../models/post");

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const router = new express.Router();
const URI = `mongodb+srv://admin:${process.env.DB_PASS}@cluster01.5gpna.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

var con = mongoose.connection;
con.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(con.db, {
    bucketName: "uploads",
  });
});

const storage = new GridFsStorage({
  url: URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buff) => {
        if (err) return reject(err);

        const filename = buff.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

router.post(
  "/create-post",
  auth,
  upload.single("image"),
  controller.createPost
);

router.put("/like", auth, async (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { Likes: req.user._id } },
    { new: true }
  )
    .populate("PostedBy", "_id name")
    .populate("Comments.PostedBy", "_id name")
    .exec((err, result) => {
      if (err)
        return res
          .status(422)
          .json({ Error: "Unexpected Error.Please try again" });
      else {
        res.json({ Message: "Post liked succesfully" });
      }
    });
});

module.exports = router;
