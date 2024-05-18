// routes/routes.js
const express = require('express')
const stationController = require('../controllers/station.controller')
const buoyController = require('../controllers/buoy.controller')
const waveController = require('../controllers/wave.controller')
const router = express.Router()

const routes = () => {
  router.get('/stations', stationController.getAllStations)
  router.get('/stations/closest', stationController.getClosestStation)
  router.get('/stations/:stationId/tides', stationController.getStationData)
  router.get('/buoys/closest', buoyController.getClosestBuoy)
  router.get('/wave-forecast', waveController.getWaveForecast)

  return router
}

module.exports = routes
