const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const connection = require("./db/mysql_connection");

let db_a = async () => {
  let cnt;
  let query = `select count(movie_id) from MP_movie`;
  try {
    [result0] = connection.query(query);
    cnt = result0;
  } catch {}

  var bucket = Array.from(Array(cnt), () => Array());
  let cntJ;
  let cntK;
  query = `select movie_id,genre_ids0,genre_ids1,genre_ids2,genre_ids3,genre_ids4,genre_ids5 
                  from MP_movie`;
  try {
    [result] = connection.query(query);
    for (let i = 0; i < result.length; i++) {
      result[i].movie_id;
      for (let i = 1; i < 6; i++) {
        result[i];
      }
    }
  } catch {}
};
