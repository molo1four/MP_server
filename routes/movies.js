const express = require("express");
const auth = require("../middleware/auth");

const {
  getMovies,
  AddLikes,
  getMovies_nl,
  getRecom,
  getRecom_AR,
} = require("../controllers/movies");

const router = express.Router();

// 각 경로 별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(auth, getMovies).post(auth, AddLikes);
router.route("/likedMovie").get(auth, getMovies_nl);
router.route("/getRecom").get(auth, getRecom);
router.route("/getRecom_AR").get(auth, getRecom_AR);
module.exports = router;
