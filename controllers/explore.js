const Post = require("../models/post");

exports.explorePosts = async (req, res) => {
  var pageNo = req.query.page !== undefined ? req.query.page : 0;
  // console.log(pageNo)
  Post.find({ PostedBy: { $ne: req.user._id }, private: "false" })
    .populate("PostedBy", "_id name")
    .populate("Comments.PostedBy", "_id name")
    .sort("-createdAt")
    .skip(pageNo*10)
    .limit(10)
    .then((data) => {
      let posts = [];
      data.map((item) => {
        const likes=item.Likes
        var likedByMe=false
        for(var like of likes)
        {
          if(like.toString()===req.user._id.toString())
            likedByMe=true;
        }
        posts.push({
          _id: item._id,
          Title: item.Title,
          Body: item.Body,
          PostedBy: item.PostedBy,
          Photos: item.Photos,
          Likes: item.Likes,
          LikedByMe:likedByMe,
          Comments: item.Comments,
        });
      });
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
};
