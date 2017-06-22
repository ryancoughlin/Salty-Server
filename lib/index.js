require("dotenv").config();
require("babel-register");

const connectToMongo = require("./connect");

connectToMongo()
  .then(() => {
    require("./server");
  })
  .catch(e => {
    console.error("Could not connect to database: ", e);
  });
