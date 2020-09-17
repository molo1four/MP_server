const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
var apriori = require("node-apriori");
const connection = require("./db/mysql_connection");

// 알고리즘 계산 프로세스

array_recom = new Array();
array_recom_AR = new Array();

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

// Execute Apriori with a minimum support of 40%.
var apriori = new apriori.Apriori(0.4);
console.log(`Executing Apriori...`);

// Returns itemsets 'as soon as possible' through events.
apriori.on("data", function (itemset) {
  // Do something with the frequent itemset.
  var support = itemset.support;
  var items = itemset.items;

  if (items.length == 1) {
    let query = `insert into MP_recom (recom_movie_id) values (${items.join()})`;
    // console.log(query);
    array_recom.push(query);
  } else if (items.length > 1) {
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (items[i] != items[j]) {
          let query = `insert into MP_recom_AR (AR_movie_id1, AR_movie_id2) values (${items[i]},${items[j]})`;

          //   console.log(query);
          array_recom_AR.push(query);
        }
      }
    }
  }

  console.log(
    `Itemset { ${items.join(
      ","
    )} } is frequent and have a support of ${support}`
  );
});

//  Execute Apriori on a given set of transactions.
apriori.exec(transactions).then(function (result) {
  // Returns both the collection of frequent itemsets and execution time in millisecond.
  var frequentItemsets = result.itemsets;
  var executionTime = result.executionTime;
  console.log(
    `Finished executing Apriori. ${frequentItemsets.length} frequent itemsets were found in ${executionTime}ms.`
  );
});

// console.log(array_recom);

let db_insert = async () => {
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
};

db_insert();
