const express = require("express");
const stationController = require("../controllers/station.controller");
const buoyController = require("../controllers/buoy.controller");
const router = express.Router();

const routes = () => {
  router.route("/tides").get(stationController.getClosestStation);
  router.route("/buoy").get(buoyController.getClosestBuoy);

  return router;
};

module.exports = routes;
