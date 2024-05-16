//waterTemperatureController.js
import request from '../request'
import noaa from '../TideData'
import { findEnhancedStation } from '../find-station'

const waterTemperatureController = () => {
  const getWaterTemperature = async (req, res, next) => {
    try {
      const { latitude, longitude } = req.query
      const waterTemperature = await findEnhancedStation(
        latitude,
        longitude
      ).then((station) => {
        return noaa.fetchWaterTemperature(station.stationId)
      })

      return res.status(200).json(waterTemperature)
    } catch (error) {
      return res.status(500).json({ message: `${JSON.stringify(error)}` })
    }
  }

  return {
    getWaterTemperature
  }
}

module.exports = waterTemperatureController
