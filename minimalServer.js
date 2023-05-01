const express = require("express");
const routes = require("./routes");

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Minimal server is working!" });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Test route works!" });
});

app.listen(3000, () => {
  console.log("Minimal server is listening on port 3000");
});
