const { off, query } = require("../db/mysql_connection");
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
// @response success, cnt, rows[movie_id, title, release_date, poster_path]
exports.getMovies_ny = async (req, res, next) => {
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

// @desc    내가 평가한 영화 불러오기
// @route   GET /api/v1/movies/getLiked:user_id?offset=0&limit=25
// @request ""
// @response success, rows[movie_id, title, release_date, poster_path]
exports.getLiked = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select m.movie_id, m.title, m.release_date, m.poster_path
  from MP_user_likes as ul 
  join MP_movie as m 
  on ul.movie_id = m.movie_id and user_id = ${user_id}
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

// @desc    알고리즘 도출값과 유저의 [좋아요]영화 목록 비교해서 일반추천
// @route   GET /api/v1/movies/getRecom:user_id?offset=0&limit=25
// @request ""
// @response success, cnt, rows[movie_id, title, release_date, poster_pat
exports.getRecom = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  // 유저가 이미 좋아요한 영화을 제외한, 일반추천영화목록을 지지도 순으로 가져오는 쿼리
  let query = `
  select re.recom_movie_id as movie_id,m.title, m.release_date, m.poster_path
  from MP_movie as m
  right join MP_recom as re
  on m.movie_id = re.recom_movie_id
  where re.recom_movie_id not in(
  select movie_id from MP_user_likes where user_id = ${user_id})
  order by re.support desc
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

// @desc    알고리즘 도출값과 유저의 [좋아요]영화 목록 비교해서 연관추천
// @route   GET /api/v1/movies/getRecom_AR:user_id?offset=0&limit=25
// @request ""
// @response success, cnt, rows[movie_id, title, release_date, poster_path
exports.getRecom_AR = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  // 유저가 이미 좋아요한 영화을 제외한, 연관추천영화목록을 지지도 순으로 가져오는 쿼리
  let query = `select distinct( re.AR_movie_id2) as movie_id ,m.title, m.release_date, m.poster_path
  from MP_movie as m
  inner join MP_recom_AR as re
  on m.movie_id = re.AR_movie_id2
  Join MP_user_likes as ul
  On ul.movie_id = re.AR_movie_id1 and ul.user_id  = ${user_id}
  where re.AR_movie_id2 not in(
  Select distinct movie_id from MP_user_likes where user_id = ${user_id})
  order by re.support desc
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

// @desc    키워드 검색
// @route   GET /api/v1/movies/searchMovie:user_id?keyword=txtSearch&offset=0&limit=25
// @request ""
// @response success, cnt, rows[movie_id, title, release_date, poster_path,
exports.searchMovie = async (req, res, next) => {
  // let user_id = req.user.id;
  let keyword = req.query.keyword;
  let conv_keyword = null;
  let offset = req.query.offset;
  let limit = req.query.limit;


  if(keyword == "모험"){
    conv_keyword = 12;
  }else if (keyword == "판타지"){
    conv_keyword = 14;
  }else if (keyword == "애니메이션"){
    conv_keyword = 16;
  }else if (keyword == "드라마"){
    conv_keyword = 18;
  }else if (keyword == "공포"){
    conv_keyword = 27;
  }else if (keyword == "액션"){
    conv_keyword = 28;
  }else if (keyword == "역사"){
    conv_keyword = 36;
  }else if (keyword == "서부"){
    conv_keyword = 37;
  }else if (keyword == "스릴러"){
    conv_keyword = 53;
  }else if (keyword == "범죄"){
    conv_keyword = 80;
  }else if (keyword == "다큐멘터리"){
    conv_keyword = 99;
  }else if (keyword == "SF"){
    conv_keyword = 878;
  }else if (keyword == "미스터리"){
    conv_keyword = 9648;
  }else if (keyword == "음악"){
    conv_keyword = 10402;
  }else if (keyword == "로맨스"){
    conv_keyword = 10749;
  }else if (keyword == "가족"){
    conv_keyword = 10751;
  }else if (keyword == "전쟁"){
    conv_keyword = 10752;
  }else if (keyword == "TV영화"){
    conv_keyword = 10770;
  }
  let query = `select distinct(m.movie_id),m.title, m.release_date, m.backdrop_path, m.poster_path, m.overview
  from MP_movie as m
  join MP_movie_genre as mg
  on m.movie_id = mg.movie_id
  where mg.genre_id = ${conv_keyword} or  
  m.title like "%${keyword}%"
  limit ${offset},${limit};`;
  console.log(query)

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, cnt: rows.length, rows });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
    return;
  }
};


exports.likesReset = async (req,res,next) =>{
  let user_id = req.user.id;

  let query = `delete from MP_user_likes where user_id = ${user_id}`

  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true, result: result });
      return;
    } else {
      res.status(400).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
}