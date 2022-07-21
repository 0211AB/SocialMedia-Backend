const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");
const Post = require("../models/post");

const controller = require("../controllers/explore");

router.get("/explore", auth, controller.explorePosts);

module.exports = router;
