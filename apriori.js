const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
var apriori1 = require("node-apriori");
const connection = require("./db/mysql_connection");

array_recom = new Array();
array_recom_AR = new Array();
var transactions;

function first() {
  console.log("** first() 시작 **");

  let db_auto = async () => {
    console.log("** db_auto 시작 **");

    // "MP_recom"테이블 초기화
    let query = `delete from MP_recom where id>0`;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
      [result] = await conn.query(query);
      console.log("recom 초기화");
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      return;
    } finally {
      conn.release(); // pool에 connection 반납
    }

    // "MP_recom"테이블의 auto_increment 초기화
    query = `ALTER TABLE MP_recom AUTO_INCREMENT = 1 ;`;
    console.log(query);
    try {
      [result] = await conn.query(query);
      console.log("recom(ai) 초기화" + result);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      return;
    } finally {
      conn.release(); // pool에 connection 반납
    }
    // "MP_recom_AR"테이블 초기화
    query = `delete from MP_recom_AR where id>0;`;
    console.log(query);
    try {
      [result] = await conn.query(query);
      await conn.commit();
      console.log("recom_AR 초기화" + result);
    } catch (e) {
      await conn.rollback();
      return;
    } finally {
      conn.release(); // pool에 connection 반납
    }

    // "MP_recom_AR"테이블의 auto_increment 초기화
    query = `ALTER TABLE MP_recom_AR AUTO_INCREMENT = 1 ;`;
    try {
      [result] = await conn.query(query);
      await conn.commit();
      console.log("recom_AR(ai) 초기화" + result);
    } catch (e) {
      await conn.rollback();
      return;
    } finally {
      conn.release(); // pool에 connection 반납
    }

    // 초기화 작업이 끝나고, 유저의 수를 파악하기 위한 셀렉트문 실행
    query = `select count(distinct user_id) AS cnt from MP_user_likes;`;
    console.log(query);
    let userCnt;
    try {
      [rows] = await conn.query(query);
      await conn.commit();
      userCnt = rows[0].cnt;
      console.log(userCnt);
    } catch (e) {
      await conn.rollback();
      return;
    } finally {
      conn.release(); // pool에 connection 반납
    }

    // 유저의 수를 파악했으면(user Cnt) 유저 수만큼 Array 생성
    transactions = Array.from(Array(userCnt), () => Array());
    console.log(transactions);
    // transactions 설정을 위한 셀렉트문 실행
    query = `select user_id, movie_id from MP_user_likes;`;
    let beforeNum;
    let cntI = 0;
    let cntJ = 0;
    try {
      [result] = await conn.query(query);
      await conn.commit();
      for (let i = 0; i < result.length; i++) {
        if (i != 0) {
          console.log("아이디" + result[i].user_id);
          console.log(beforeNum == result[i].user_id);
          console.log(transactions);
          if (beforeNum == result[i].user_id) {
            console.log("test" + cntJ);
            cntJ++;
            transactions[cntI][cntJ] = result[i].movie_id;
          } else {
            console.log("test" + cntI);
            cntI++;
            cntJ = 0;
            transactions[cntI][cntJ] = result[i].movie_id;
          }
        } else {
          cntJ++;
          transactions[cntI][cntJ] = result[i].movie_id;
        }

        beforeNum = result[i].user_id;
      }

      algorism();
    } catch (e) {
      await conn.rollback();
      return;
    } finally {
      conn.release(); // pool에 connection 반납
    }
    await conn.commit();
  };

  db_auto();

  function algorism() {
    console.log("** function a() 시작 **");
    // Execute Apriori with a minimum support of 40%.
    var apriori = new apriori1.Apriori(0.3);
    console.log(`Executing Apriori...`);

    // Returns itemsets 'as soon as possible' through events.
    apriori.on("data", function (itemset) {
      console.log("** apriori 연산 시작 **");
      // Do something with the frequent itemset.
      var support = itemset.support;
      var items = itemset.items;

      if (items.length == 1) {
        let query = `insert into MP_recom (recom_movie_id,support) values (${items.join()},${support})`;
        console.log("insert 쿼리문 제작 : " + query);
        array_recom.push(query);
      } else if (items.length > 1) {
        for (let i = 0; i < items.length; i++) {
          for (let j = 0; j < items.length; j++) {
            if (items[i] != items[j]) {
              let query = `insert into MP_recom_AR (AR_movie_id1, AR_movie_id2,support) values (${items[i]},${items[j]},${support})`;

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
    let query = array_recom[i];
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
