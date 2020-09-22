// db 연결
const connection = require("../db/mysql_connection");

// @desc    영화 데이터 불러오기
// @route   GET /api/v1/movies?offset=0&limit=25
// @request ""
// @response success, rows[movie_id, title, release_date, poster_path]
exports.getMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select movie_id, title, release_date, poster_path from MP_movie limit ${offset}, ${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, cnt: rows.length, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    선호 영화 입력하기
// @route   POST /api/v1/movies
// @request [body] user_id, movie_id
// @response success
exports.AddLikes = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_id = req.body.movie_id;
  for (let i = 0; i < movie_id.length; i++) {
    let query = `insert into MP_user_likes(user_id,movie_id) values (${user_id},${movie_id[i].movie_id})`;
    console.log(query);
    try {
      [rows] = await connection.query(query);
    } catch (e) {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  res.status(200).json({ success: true, rows });
};

// @desc    평가하지 않은 영화목록 불러오기
// @route   GET /api/v1/movies/doLikes:user_id?offset=0&limit=25
// @request ""
// @response success, rows[movie_id, title, release_date, poster_path]
exports.getMovies_nl = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `SELECT M.movie_id, M.title, M.release_date, M.poster_path
	FROM MP_movie AS M
	LEFT JOIN MP_user_likes AS UL
	ON UL.movie_id = M.movie_id AND UL.user_id = ${user_id}
  WHERE UL.id IS NULL
  limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, cnt: rows.length, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    알고리즘 도출값과 유저의 [좋아요]영화 목록 비교해서 일반추천
// @route   GET /api/v1/movies/getRecom:user_id?offset=0&limit=25
// @request ""
// @response success,cnt, rows[]
exports.getRecom = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  // 유저가 이미 좋아요한 영화을 제외한, 일반추천영화목록을 가져오는 쿼리
  let query = `
  select re.recom_movie_id
    from MP_user_likes as ul
      right outer join MP_recom as re 
      on ul.movie_id = re.recom_movie_id and ul.user_id = ${user_id}
      where ul.movie_id is null
      limit ${offset}, ${limit};`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, cnt: rows.length, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    알고리즘 도출값과 유저의 [좋아요]영화 목록 비교해서 연관추천
// @route   GET /api/v1/movies/getRecom_AR:user_id?offset=0&limit=25
// @request ""
// @response success,cnt, rows[]
exports.getRecom_AR = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  // 유저가 이미 좋아요한 영화을 제외한, 연관추천영화목록을 가져오는 쿼리
  let query = `Select distinct(b.AR_movie_id2)
  From MP_user_likes as a
  Join MP_recom_AR as b
  On b.AR_movie_id1 = a.movie_id and a.user_id  = ${user_id}
  Where b.AR_movie_id2 not in(
  Select distinct movie_id from MP_user_likes where user_id = ${user_id})
  limit ${offset},${limit};`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, cnt: rows.length, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
    return;
  }
};
