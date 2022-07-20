const User = require("../models/user");
const auth = require("../middlewares/auth");
const Post = require("../models/post");

exports.explorePosts = async (req, res) => {
  var pageNo = req.query.page !== undefined ? req.query.page : 1;
  Post.find({ PostedBy: { $ne: req.user._id }, private: "false" })
    .populate("PostedBy", "_id name")
    .populate("Comments.PostedBy", "_id name")
    .sort("-createdAt")
    .skip(pageNo)
    .limit(10)
    .then((data) => {
      let posts = [];
      data.map((item) => {
        posts.push({
          _id: item._id,
          Title: item.Title,
          Body: item.Body,
          PostedBy: item.PostedBy,
          Photo: item.Photo,
          Likes: item.Likes,
          Comments: item.Comments,
        });
      });
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
};
