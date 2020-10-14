const express = require("express");
const auth = require("../middleware/auth");

const { createUser, loginUser, logout, withdrawal } = require("../controllers/users");

const router = express.Router();

// 각 경로 별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").delete(auth, logout);
router.route("/withdrawal").delete(auth, withdrawal);
module.exports = router;
