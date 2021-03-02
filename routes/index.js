const express = require("express");
const controllers = require("../controllers");

const routes = function () {
  const apiRoute = express.Router();

  const stationController = controllers.stationController();
  apiRoute.route("/tide-table").get(stationController.getTideTable);
  apiRoute.route("/tide-chart").get(stationController.getTideChart);
  apiRoute.route("/weather-forecast").get(stationController.getWeatherForecast);

  const swellController = controllers.swellController();
  apiRoute.route("/swell").get(swellController.getSwell);

  const waterTemperatureController = controllers.waterTemperatureController();
  apiRoute
    .route("/water-temperature")
    .get(waterTemperatureController.getWaterTemperature);

  return apiRoute;
};

module.exports = routes;
