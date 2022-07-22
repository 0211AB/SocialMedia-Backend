const Post = require("../models/post");

exports.createPost = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body)
      return res
        .status(400)
        .json({ Error: "Please enter all the required fields." });

    var photos = [];
    for (var file of req.files) {
      photos.push(file.id);
    }

    const post = new Post({
      Title: title,
      Body: body,
      Photos: photos,
      PostedBy: req.user,
    });
    const saved_post = await post.save();
    if (!saved_post)
      return res
        .status(400)
        .json({ Error: "Unexpected error please try again." });

    res.json({ message: "Post created successfully" });
  } catch (e) {
    console.log(e);
    res.status(404).json({ Message: `${e.message.split(":")[2]}` });
  }
};

exports.likePost = async (req, res) => {
  try {
    const liked = await Post.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { Likes: req.user._id } },
      { new: true }
    );

    if (liked)
      return res.status(200).json({ Message: "Post liked succesfully" });

    res.json({ Error: "Unexpected Error.Please try again" });
  } catch (e) {
    res.status(404).json({ Error: "Unexpected Error.Please try again" });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const comment = { Text: req.body.text, PostedBy: req.user._id };
    const updatedPost = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { Comments: comment },
      },
      { new: true }
    );
    if (updatedPost)
      return res.status(200).json({ Message: "Commented succesfully" });
    res.json({ Error: "Unexpected Error.Please try again" });
  } catch (e) {
    res.status(404).json({ Error: "Unexpected Error.Please try again" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });

    if (!post) return res.status(422).json({ Error: "No such post found" });

    if (post.PostedBy._id.toString() !== req.user._id.toString())
      return res
        .status(422)
        .json({ Error: "You are not the author of this post." });

    const remPost = await post.remove();
    if (remPost) return res.json({ Message: "Post removed sucessfully!!" });
    res.json({ Error: "Unexpected Error.Please try again" });
  } catch (e) {
    res.json({ Error: "Unexpected Error.Please try again" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    if (!post) return res.status(422).json({ Error: "No such post found" });

    if (post.PostedBy._id.toString() !== req.user._id.toString())
      return res
        .status(422)
        .json({ Error: "You are not the author of this post." });

    var photos = [];
    for (var file of req.files) {
      photos.push(file.id);
    }

    const { title, body } = req.body;
    post.Title = title !== null ? title : post.Title;
    post.Body = body !== null ? body : post.Body;
    post.Photos = req.files !== null ? photos : post.Photos;
    const saved_post = await post.save();
    if (saved_post) res.json({ message: "Post updated successfully" });
  } catch (e) {
    console.log(e);
    res.status(404).json({ Message: `${e.message.split(":")[2]}` });
  }
};
