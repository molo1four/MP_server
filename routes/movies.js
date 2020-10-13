const express = require("express");
const auth = require("../middleware/auth");

const {
  getMovies,
  AddLikes,
  getRecom,
  getRecom_AR,
  getMovies_ny,
  getLiked,
  searchMovie,
} = require("../controllers/movies");

const router = express.Router();

// 각 경로 별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(auth, getMovies).post(auth, AddLikes);
router.route("/getLiked").get(auth, getLiked);
router.route("/getMovies_ny").get(auth, getMovies_ny);
router.route("/getRecom").get(auth, getRecom);
router.route("/getRecom_AR").get(auth, getRecom_AR);
router.route("/searchMovies").get(auth, searchMovie)
module.exports = router;
