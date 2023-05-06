//swell.controller.js
import { getSwellForecast } from '../services/swellForecast'

export const getSwell = async (req, res) => {
  try {
    const { latitude, longitude } = req.query
    const swellForecast = await getSwellForecast(latitude, longitude)
    return res.status(200).json(swellForecast)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
