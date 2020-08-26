// 네트워크를 통해서 다른 서버의 api를 호출하기 위해서

const request = require("postman-request");
const connection = require("./mysql_connection");

connection.query(query, function (error, results, fields) {
  console.log(results);
});
connection.end();
