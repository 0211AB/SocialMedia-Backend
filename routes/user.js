const express = require("express");
const router = new express.Router();
const controller = require("../controllers/user");

router.post("/signup", controller.signupUser );

router.post("/login", controller.loginUser );

router.put("/user-update/:uid", auth, controller.updateUser);

router.put("/follow", auth,controller.followUser);

router.put("/unfollow", auth, controller.unfollowUser);

router.get("/user-profile",auth,controller.userProfile)

router.put("/block-user",auth,controller.userProfile)

module.exports = router;
