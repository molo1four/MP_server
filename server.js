const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

//사진 관련
const fileupload = require("express-fileupload");
const path = require("path");

//라우터 관련
const users = require("./routes/users");
const posting = require("./routes/posting");
const movies = require("./routes/movies");

//익스프레스 연결
const app = express();

// post 사용 시 , body 부분을 json으로 사용하겠다.
app.use(fileupload());
// 이미지를 불러올 수 있도록 static 경로 설정
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

//라우터 처리 부분
app.use("/api/v1/posting", posting);
app.use("/api/v1/users", users);
app.use("/api/v1/movies", movies);

const PORT = process.env.PORT || 5700;

app.listen(PORT, () => {
  console.log("App listening on port 5700!");
});
