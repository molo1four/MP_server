// 클라이언트의 헤더에 셋팅된
// Authorization 값 (Token) 을 확인하여
// 인증한다.

const jwt = require("jsonwebtoken");
const connection = require("../db/mysql_connection");

const auth = async (req, res, next) => {
  console.log("인증 미들웨어");
  let token = req.header("Authorization");
  token = token.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Not token" });
    return;
  }
  console.log(token);

  //토큰에 저장된 정보를 디코드한다.
  let user_id;
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decode);
    user_id = decode.user_id;
  } catch (e) {
    res.status(401).json({ error: "토큰이 잘못됨" });
  }

  //위의 유저 아이디로 DB에서 TOKEN 정보를 가져온다
  let query = `select * from sns_token where user_id = ${user_id}`;
  try {
    [rows] = await connection.query(query);
    console.log(rows);
  } catch (e) {
    res.status(500).json({ error: "DB 에러" });
  }

  // 반복문 돌면서 유저 아이디와 토큰이 맞는지 체크
  let isCorrect = false;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].user_id == user_id && rows[i].token == token) {
      isCorrect = true;
      break;
    }
  }
  // 유효한 토큰이 맞으니까 유저 정보를 db에서 가져옵니다
  if (isCorrect) {
    query = `select * from sns_user where id = ${user_id}`;
    try {
      [rows] = await connection.query(query);
      // 유저 정보를 req에 셋팅해서 next() 한다
      // 이유? 인증하면서 유저 정보를 아예 가져와서 ,req에 저장시키기때문에
      //API 함수에서는 유저 정보를 가져오는 코드 작성이 필요없다
      console.log(rows[0]);
      let user = rows[0];
      // 패스워드 정보는 삭제하고 req에 담아준다
      delete user.passwd;
      req.user = user;
      req.user.token = token;
      next();
    } catch (e) {
      res.status(500).json({ error: "DB에러" });
    }
  } else {
    res.status(401).json({ error: "인증이 안된 토큰입니다" });
  }
};

module.exports = auth;
