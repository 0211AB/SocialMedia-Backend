const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");
const Post=require("../models/post")

router.post("/signup", async (req, res) => {
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
    //console.log(token)

    const saved_user = await user.save();
    //console.log(saved_user)

    res.status(201).json({ Message: "User Sign Up Succesful" });
  } catch (e) {
    // console.log(e);
    if (e.code == 11000)
      return res
        .status(400)
        .json({ Message: `${Object.keys(e.keyPattern)[0]} already exists` });

    res.status(404).json({ Message: `${e.message.split(":")[2]}` });
  }
});

router.post("/login", async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;

    const user = await User.findOne({ email });
    if (!user) res.status(404).json({ Error: "User not found" });
    else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      //console.log(isPasswordValid)

      if (isPasswordValid) {
        //console.log(user.tokens)
        const token = await user.generateAuthToken();
        const saved_user = await user.save();
        //console.log(saved_user)

        res.status(200).json({ Message: "Login Successful" });
      } else {
        res.status(400).json({ Message: "Incorrect Credentials" });
      }
    }
  } catch (e) {
    res.status(404).json(e);
  }
});

router.put("/user-update/:uid", auth, async (req, res) => {
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
});

router.put("/follow", auth, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { Followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ Error: "Unexpected Error .Please try again" });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { Following: req.body.followId },
        },
        { new: true }
      )
        .then((result) => {
          res.json({Message:"Followed Sucessfully!!"});
        })
        .catch((err) => {
          return res.status(422).json({ Error: "Unexpected Error .Please try again" });
        });
    }
  );
});

router.put("/unfollow", auth, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { Followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ Error: "Unexpected Error .Please try again" });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { Following: req.body.unfollowId },
        },
        { new: true }
      )
        .then((result) => {
          res.json({Message:"Unfollowed Sucesfully!!"});
        })
        .catch((err) => {
          return res.status(422).json({ Error: "Unexpected Error .Please try again" });
        });
    }
  );
});

module.exports = router;
