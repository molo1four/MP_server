// 1번 유저의 목록 ${user_id}= [119, 125, 126, 134, 139]
// 도출된 계산값 = [119,120,122,123,125,126,129,136,137,139,//[120,122],[122,136],[123,129],[126,139]]
// array.legnth 혹은 array.size >= 2 면 second 어레이에 저장, array.size = 1 이면 one 어레이에 저장 (jsonobject = {one,second} )
// 계산값을 제이슨으로 바꾸면
//                jsonobject = {one : [120,122,123,126,129,136,137,139] , second :[[120,122],[122,136],[123,129],[126,139]] }
//
// 유저랑 비교 후 중복여부에 따라 one에 추가 [119, 125, 126, 134, 139]  // second :[[120,122],[122,136],[123,129],[126,139]]
// one이랑 ${user_id}랑 비교해서 중복제거
// [최종결과값...] < 얘들로 rows를 만들어서 android에 구현

// db 연결
const connection = require("./db/mysql_connection");
var apriori = require("node-apriori");

// 알고리즘 계산 프로세스

var transactions = [
  [119, 125, 126, 134, 139],
  [119, 121, 123, 126, 127, 129, 139, 143],
  [119, 120, 122, 124, 126, 136, 139, 141],
  [120, 122, 124, 125, 126, 136, 137, 138],
  [120, 121, 122, 125, 132, 133, 136, 137, 140],
  [120, 122, 123, 126, 129, 130, 131, 135, 142],
  [123, 126, 127, 128, 131, 133, 137, 139, 141, 142],
  [121, 122, 123, 128, 129, 130, 132, 134, 135, 136, 137, 138, 142],
  [119, 122, 123, 125, 127, 129, 132, 140, 141],
  [126, 128, 130, 131, 138, 139],
  [
    119,
    120,
    121,
    122,
    123,
    124,
    125,
    126,
    127,
    128,
    129,
    130,
    131,
    132,
    133,
    134,
    135,
    136,
    137,
    138,
    139,
    140,
  ],
];

// * == 위 값을 쿼리문 결과값으로 대체?
// select
//     CONCAT("[", GROUP_CONCAT(movie_id SEPARATOR ','),"]",",") as MovieName
// from MP_user_likes
// group by user_id;

// Execute Apriori with a minimum support of 40%.
var apriori = new apriori.Apriori(0.4);
console.log(`Executing Apriori...`);

// Returns itemsets 'as soon as possible' through events.
apriori.on("data", async function (itemset) {
  // Do something with the frequent itemset.
  var support = itemset.support;
  var items = itemset.items;

  if (items.length == 1) {
    let query = `insert into MP_recom (recom_movie_id) values (${items.join()})`;
    console.log(query);
    try {
      connection.query(query);
    } catch (e) {
      console.log(e);
      return;
    }
  } else if (items.length > 1) {
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (items[i] != items[j]) {
          let query = `insert into MP_recom_AR (movie_id1, movie_id2) values (${items[i]},${items[j]})`;

          console.log(query);
          try {
            connection.query(query);
          } catch (e) {
            console.log(e);
            return;
          }
        }
      }
    }
  }

  // console.log(
  //   `Itemset { ${items.join(
  //     ","
  //   )} } is frequent and have a support of ${support}`
  // );
});

// Execute Apriori on a given set of transactions.
apriori.exec(transactions).then(function (result) {
  // Returns both the collection of frequent itemsets and execution time in millisecond.
  var frequentItemsets = result.itemsets;
  var executionTime = result.executionTime;
  console.log(
    `Finished executing Apriori. ${frequentItemsets.length} frequent itemsets were found in ${executionTime}ms.`
  );
});
