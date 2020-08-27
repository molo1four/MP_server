const express = require("express");
const auth = require("../middleware/auth");

const { getMovies, AddLikes, getMovies_nl } = require("../controllers/movies");

const router = express.Router();

// 각 경로 별로 데이터 가져올 수 있도록, router 셋팅
router.route("/").get(auth, getMovies).post(auth, AddLikes);
router.route("/doLikes").get(auth, getMovies_nl);

module.exports = router;
