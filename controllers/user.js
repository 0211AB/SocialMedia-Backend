const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");


exports.signupUser = async (req, res) => {
  try {
    var reqBody = req.body;
    const latestUser = await User.find().sort({ _id: -1 }).limit(1);
    if (latestUser.length === 0) {
      reqBody = {
        ...reqBody,
        user_id: 1001,
      };
    } else {
      reqBody = {
        ...reqBody,
        user_id: parseInt(latestUser[0].user_id) + 1,
      };
    }
    var user = new User(reqBody);
    const token = await user.generateAuthToken();

    const saved_user = await user.save();

    res.status(201).json({ Message: "User Sign Up Succesful" });
  } catch (e) {
    if (e.code == 11000)
      return res
        .status(400)
        .json({ Message: `${Object.keys(e.keyPattern)[0]} already exists` });

    res.status(404).json({ Message: `${e.message.split(":")[2]}` });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;

    const user = await User.findOne({ email });
    if (!user) res.status(404).json({ Error: "User not found" });
    else {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const token = await user.generateAuthToken();
        const saved_user = await user.save();

        res.status(200).json({ Message: "Login Successful" });
      } else {
        res.status(400).json({ Message: "Incorrect Credentials" });
      }
    }
  } catch (e) {
    console.log(e)
    res.status(404).json(e);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user_id = req.params.uid;
    const reqBody = { ...req.body };

    const user = await User.findOneAndUpdate({ user_id }, { $set: reqBody });
    if (!user) res.status(404).json({ Error: "Invalid Credentials" });
    else {
      const token = await user.generateAuthToken();
      const saved_user = await user.save();
      res.status(200).json({ Message: "User updated sucessfully" });
    }
  } catch (e) {
    if (e.code == 11000)
      return res
        .status(400)
        .json({ Message: `${Object.keys(e.keyPattern)[0]} already exists` });

    res.status(404).json({ Message: `${e.message.split(":")[2]}` });
  }
};

exports.followUser = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $addToSet: { Followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res
          .status(422)
          .json({ Error: "Unexpected Error .Please try again" });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { Following: req.body.followId },
        },
        { new: true }
      )
        .then((result) => {
          res.json({ Message: "Followed Sucessfully!!" });
        })
        .catch((err) => {
          return res
            .status(422)
            .json({ Error: "Unexpected Error .Please try again" });
        });
    }
  );
};

exports.unfollowUser = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { Following: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(422)
          .json({ Error: "Unexpected Error .Please try again" });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { Followers: req.body.unfollowId },
        },
        { new: true }
      )
        .then((result) => {
          res.json({ Message: "Unfollowed Sucesfully!!" });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(422)
            .json({ Error: "Unexpected Error .Please try again" });
        });
    }
  );
};

exports.userProfile = async (req, res) => {
  try {
    var likes=[]
    var count=0
    Post.aggregate([
      { $match: { PostedBy: req.user._id }},
      {
        $redact: {
          $cond: [
            { $gte: [{ $size: "$Likes" }, 1] },
            "$$KEEP",
            "$$PRUNE",
          ],
        },
      },
    ]).exec((err, users) => {
      if (err) throw err;

      for(var user of users)
        for(var like of user.Likes)
            likes.push(like)

    });

    var postCount = await Post.count({PostedBy: req.user._id});

    const user = {
      name: req.user.name,
      user_name: req.user.user_name,
      gender: req.user.gender,
      mobile: req.user.mobile,
      email: req.user.email,
      followerCount: req.user.Followers.length,
      followingCount: req.user.Following.length,
      listOfUsersLikedmyPosts:likes,
      postCount
    };

    res.status(200).json({user})
    
  } catch (e) {
    console.log(e);
  }
};
