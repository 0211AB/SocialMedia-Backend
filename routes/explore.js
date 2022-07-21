const express = require("express");
const router = new express.Router();
const auth = require("../middlewares/auth");

const controller = require("../controllers/explore");

router.get("/explore", auth, controller.explorePosts);

module.exports = router;
