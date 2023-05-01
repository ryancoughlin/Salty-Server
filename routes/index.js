const express = require("express");
const { stationController, swellController } = require("../controllers");
const router = express.Router();

const routes = () => {
  const tideCtrl = stationController;
  const swellCtrl = swellController();

  router.route("/tides").get(tideCtrl.getClosestStation);
  router.route("/swells").get(swellCtrl.getSwell);

  return router;
};

module.exports = routes;
