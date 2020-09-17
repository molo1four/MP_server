const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
var apriori1 = require("node-apriori");
const connection = require("./db/mysql_connection");

array_recom = new Array();
array_recom_AR = new Array();
var transactions;

function first() {
  console.log("** first() 시작 **");

  let db_loading = async () => {
    console.log("** db_loading 시작 **");
    let query = `select count(distinct user_id) AS cnt from MP_user_likes;`;
    let userCnt;
    try {
      [rows] = await connection.query(query);
      userCnt = rows[0].cnt;
    } catch (e) {
      console.log(e);
      return;
    }

    transactions = Array.from(Array(userCnt), () => Array());

    query = `select user_id, movie_id from MP_user_likes;`;
    let beforeNum;
    let cntI = 0;
    let cntJ = 0;
    try {
      [rows] = await connection.query(query);
      console.log("** db_loading 완료 **");
      for (let i = 0; i < rows.length; i++) {
        if (i != 0) {
          // console.log("아이디" + rows[i].user_id);
          // console.log(beforeNum == rows[i].user_id);
          // console.log(transactions);
          if (beforeNum == rows[i].user_id) {
            //console.log("test" + cntJ);
            cntJ++;
            transactions[cntI][cntJ] = rows[i].movie_id;
          } else {
            //console.log("test" + cntI);
            cntI++;
            cntJ = 0;
            transactions[cntI][cntJ] = rows[i].movie_id;
          }
        } else {
          cntJ++;
          transactions[cntI][cntJ] = rows[i].movie_id;
        }

        beforeNum = rows[i].user_id;
      }

      algorism();
    } catch (e) {
      console.log(e);
      return;
    }
  };

  db_loading();

  function algorism() {
    console.log("** function a() 시작 **");
    // Execute Apriori with a minimum support of 40%.
    var apriori = new apriori1.Apriori(0.4);
    console.log(`Executing Apriori...`);

    // Returns itemsets 'as soon as possible' through events.
    apriori.on("data", function (itemset) {
      console.log("** apriori 연산 시작 **");
      // Do something with the frequent itemset.
      var support = itemset.support;
      var items = itemset.items;

      if (items.length == 1) {
        let query = `insert into MP_recom (recom_movie_id) values (${items.join()})`;
        console.log("insert 쿼리문 제작 : " + query);
        array_recom.push(query);
      } else if (items.length > 1) {
        for (let i = 0; i < items.length; i++) {
          for (let j = 0; j < items.length; j++) {
            if (items[i] != items[j]) {
              let query = `insert into MP_recom_AR (AR_movie_id1, AR_movie_id2) values (${items[i]},${items[j]})`;

              console.log("insert 쿼리문2 제작 : " + query);
              array_recom_AR.push(query);
            }
          }
        }
      }

      // 결과값을 확인하는 로그
      // console.log(
      //   `Itemset { ${items.join(
      //     ","
      //   )} } is frequent and have a support of ${support}`
      // );
    });

    //  Execute Apriori on a given set of transactions.
    apriori.exec(Array.from(transactions)).then(function (result) {
      // Returns both the collection of frequent itemsets and execution time in millisecond.
      var frequentItemsets = result.itemsets;
      var executionTime = result.executionTime;
      console.log(
        `Finished executing Apriori. ${frequentItemsets.length} frequent itemsets were found in ${executionTime}ms.`
      );
    });
  }
  console.log("** first() 끝 **");
}
console.log("** first() 선언 끝 **");
first();

let db_insert = async () => {
  console.log("** db_insert 시작 **");
  for (let i = 0; i < array_recom.length; i++) {
    if (i == 0) {
      let query = array_recom[i];
    }
    query = array_recom[i];
    console.log(query);
    try {
      [rows] = await connection.query(query);
      console.log(rows);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  for (let j = 0; j < array_recom_AR.length; j++) {
    let query = array_recom_AR[j];
    console.log(query);
    try {
      [rows] = await connection.query(query);
      console.log(rows);
    } catch (e) {
      console.log(e);
      return;
    }
  }
  connection.end();
};
setTimeout(db_insert, 10000);
