const arrayToTxtFile = require("array-to-txt-file");

const dotenv = require("dotenv");
const { findIndex } = require("mysql2/lib/constants/charset_encodings");
dotenv.config({ path: "./config/config.env" });
const connection = require("./db/mysql_connection");

let genre_loading = async () => {
  let query = `select movie_id,genre_ids0,genre_ids1,genre_ids2,genre_ids3,genre_ids4,genre_ids5
                  from MP_movie order by movie_id`;

  array_insert = new Array();

  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query);
    console.log(result);
    console.log(result.length);
    console.log(
      "if 문 밖 :",
      // result[0].movie_id,
      result[0].genre_ids0,
      result[0].genre_ids1,
      result[0].genre_ids2,
      result[0].genre_ids3,
      result[0].genre_ids4,
      result[0].genre_ids5
    );
    if (
      result[0].genre_ids1 == null &&
      result[0].genre_ids2 == null &&
      result[0].genre_ids3 == null &&
      result[0].genre_ids4 == null &&
      result[0].genre_ids5 == null
    ) {
      console.log(
        "if 문 안 :",
        // result[0].movie_id,
        result[0].genre_ids0,
        result[0].genre_ids1,
        result[0].genre_ids2,
        result[0].genre_ids3,
        result[0].genre_ids4,
        result[0].genre_ids5
      );
    }
    for (let i = 0; i < result.length; i++) {
      if (
        result[i].genre_ids1 == null &&
        result[i].genre_ids2 == null &&
        result[i].genre_ids3 == null &&
        result[i].genre_ids4 == null &&
        result[i].genre_ids5 == null
      ) {
        let insert = `insert into MP_movie_genre (movie_id,genre_id) values (${result[i].movie_id},${result[i].genre_ids0});`;
        array_insert.push(insert);
      } else if (
        result[i].genre_ids2 == null &&
        result[i].genre_ids3 == null &&
        result[i].genre_ids4 == null &&
        result[i].genre_ids5 == null
      ) {
        let insert = `insert into MP_movie_genre (movie_id,genre_id) values (${result[i].movie_id},${result[i].genre_ids0}),(${result[i].movie_id},${result[i].genre_ids1});`;
        array_insert.push(insert);
      } else if (
        result[i].genre_ids3 == null &&
        result[i].genre_ids4 == null &&
        result[i].genre_ids5 == null
      ) {
        let insert = `insert into MP_movie_genre (movie_id,genre_id) values (${result[i].movie_id},${result[i].genre_ids0}),(${result[i].movie_id},${result[i].genre_ids1}),(${result[i].movie_id},${result[i].genre_ids2});`;
        array_insert.push(insert);
      } else if (result[i].genre_ids4 == null && result[i].genre_ids5 == null) {
        let insert = `insert into MP_movie_genre (movie_id,genre_id) values (${result[i].movie_id},${result[i].genre_ids0}),(${result[i].movie_id},${result[i].genre_ids1}),(${result[i].movie_id},${result[i].genre_ids2}),(${result[i].movie_id},${result[i].genre_ids3});`;
        array_insert.push(insert);
      } else if (result[i].genre_ids5 == null) {
        let insert = `insert into MP_movie_genre (movie_id,genre_id) values (${result[i].movie_id},${result[i].genre_ids0}),(${result[i].movie_id},${result[i].genre_ids1}),(${result[i].movie_id},${result[i].genre_ids2}),(${result[i].movie_id},${result[i].genre_ids3}),(${result[i].movie_id},${result[i].genre_ids4});`;
        array_insert.push(insert);
      } else if (result[i].genre_ids5 != null) {
        let insert = `insert into MP_movie_genre (movie_id,genre_id) values (${result[i].movie_id},${result[i].genre_ids0}),(${result[i].movie_id},${result[i].genre_ids1}),(${result[i].movie_id},${result[i].genre_ids2}),(${result[i].movie_id},${result[i].genre_ids3}),(${result[i].movie_id},${result[i].genre_ids4}),(${result[i].movie_id},${result[i].genre_ids5});`;
        array_insert.push(insert);
      }

      arrayToTxtFile(array_insert, "./test-output.txt", (err) => {
        if (err) {
          console.error(err);
          //return;
        }
        console.log("Successfully wrote to txt file");
      });
      // console.log(array_insert);
    }

    console.log(array_insert);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    return;
  } finally {
    conn.release();
  }
};
genre_loading();

function downloadString(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });

  var a = document.createElement("a");
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 1500);
}
