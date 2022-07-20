const Post = require("../models/post");
const User = require("../models/user");

exports.createPost = async (req, res) => {
  try {
    // console.log(req.file.id);
    // console.log(req.body.title);
    const { title, body } = req.body;
    if (!title || !body)
      return res
        .status(400)
        .json({ Error: "Please enter all the required fields." });
    const post = new Post({
      Title: title,
      Body: body,
      Photo: req.file.id,
      PostedBy: req.user,
    });

    // console.log(post)
    const saved_post = await post.save();
    if (saved_post) res.json({ message: "Post created successfully" });
  } catch (e) {
    res.status(404).json({ Message: `${e.message.split(":")[2]}` });
  }
};
