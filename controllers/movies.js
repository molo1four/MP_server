// db 연결
const connection = require("../db/mysql_connection");

// @desc    영화 데이터 불러오기
// @route   GET /api/v1/movies
// @request ""
// @response success, rows[movie_id, title, release_date, poster_path]
exports.getMovies = async (req, res, next) => {
  let query = `select movie_id, title, release_date, poster_path from MP_movie`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
    return;
  }
};
