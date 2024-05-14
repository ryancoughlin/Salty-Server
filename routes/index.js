// routes/routes.js
const express = require('express')
const stationController = require('../controllers/station.controller')
const buoyController = require('../controllers/buoy.controller')
const swellController = require('../controllers/swell.controller')
const waveController = require('../controllers/wave.controller')
const router = express.Router()

const routes = () => {
  router.route('/tides').get(stationController.getClosestStation)
  router.route('/buoy').get(buoyController.getClosestBuoy)
  router.route('/swells').get(swellController.getSwell)
  router.route('/wave').get(waveController.getWaveData)

  return router
}

module.exports = routes
