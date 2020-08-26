const express = require("express");
const auth = require("../middleware/auth");

const {
  postUpload,
  getPost,
  fixPost,
  deletePost,
} = require("../controllers/posting");

const router = express.Router();

// 각 경로 별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").post(auth, postUpload).get(auth, getPost);
router.route("/fix/").post(auth, fixPost);
router.route("/delete/").delete(auth, deletePost);

module.exports = router;
