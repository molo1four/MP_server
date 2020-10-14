const connection = require("../db/mysql_connection");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// @desc    회원가입
// @route   POST /api/v1/users
// @parameters  email, password
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.passwd;

  const hashedPassword = await bcrypt.hash(password, 8);

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(501).json({ success: false });
    return;
  }

  let query = "insert into MP_user (email, passwd) values ?";

  data = [email, hashedPassword];
  let user_id;
  try {
    [result] = await connection.query(query, [[data]]);
    user_id = result.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      //이메일 중복된것이다
      res
        .status(400)
        .json({ success: false, errno: 1, message: "이메일 중복" });
      return;
    } else {
      console.log(e);
      res.status(502).json({ success: false, error: e });
      return;
    }
  }
  // 토큰 토큰 토큰
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into MP_token (token, user_id) values (?,?)";
  data = [token, user_id];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(503).json({ success: false, error: e });
  }
};

// 로그인 api를 개발.
// @desc    로그인
// @route   POST /api/v1/users/login
// @parameters email, passwd
exports.loginUser = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.passwd;

  let query = `select * from MP_user where email = "${email}" `;

  try {
    [rows] = await connection.query(query);

    // 비밀번호 체크 : 비밀번호가 서로 맞는지 체크
    let savedPassword = rows[0].passwd;
    let isMatch = bcrypt.compareSync(password, savedPassword);

    if (isMatch == false) {
      res.status(400).json({ success: false, result: isMatch });
      return;
    }

    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.ACCESS_TOKEN_SECRET
    );

    query = `insert into MP_token (token, user_id) values (?,?)`;
    let data = [token, rows[0].id];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true, result: isMatch, token: token });
    } catch (e) {
      console.log("  ************  1번째  ", e);
      res.status(501).json({ success: false, error: e });
    }
  } catch (e) {
    console.log("  ************  2번째  ", e);
    res.status(502).json({ success: false, error: e });
  }
};

// @desc  로그아웃 api : DB에 해당 유저의 현재 토큰값을 삭제
// @route POST /api/v1/users/logout
// @parameters  no
exports.logout = async (req, res, next) => {
  // 토큰테이블에서 현재 이 헤더에 있는 토큰으로 삭제한다
  let token = req.user.token;
  let user_id = req.user.id;

  let query = `delete from MP_token where user_id = ${user_id} and token = "${token}"`;

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
};

exports.withdrawal = async(req,res,next) =>{
  let token = req.user.token;
  let user_id = req.user.id;

  let query = `delete from MP_token where user_id = ${user_id}`

  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    return;
  } finally {
    conn.release(); // pool에 connection 반납
  }

  query = `delete from MP_user where id = ${user_id}`

  try {
    [rows] = await connection.query(query);
    console.log(rows);
  } catch (e) {
    console.log(e);
    return;
  } finally {
    conn.release(); // pool에 connection 반납
  }
}


