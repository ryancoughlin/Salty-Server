import noaa from "../noaa";
import { findStation } from "../find-station";
import { fetchForecast } from "../weather-forecast";
import WeatherFormatter from "../weather-formatter";

const stationController = () => {
  const getTideTable = async (req, res, next) => {
    try {
      const { latitude, longitude } = req.query;
      const station = await findStation(latitude, longitude)
        .then((station) => {
          return noaa.fetchPredictions(station.stationId);
        })
        .catch((error) => console.error(error));
      console.log(station);
      return res.status(200).json(station);
    } catch (error) {
      return res.status(500).json({ message: `${JSON.stringify(error)}` });
    }
  };
  const getTideChart = async (req, res, next) => {
    try {
      const tideChart = await findStation(req.query)
        .then((station) => {
          return noaa.fetchHourlyPredictions(station.stationId);
        })
        .catch((error) => console.error(error));
      return res.status(200).json(tideChart);
    } catch (error) {
      return res.status(500).json({ message: `${JSON.stringify(error)}` });
    }
  };
  const getWeatherForecast = async (req, res, next) => {
    try {
      const { latitude, longitude } = req.query;
      const weather = await fetchForecast(latitude, longitude)
        .then((json) => {
          return new WeatherFormatter(
            req.query.latitide,
            req.query.longitude,
            json
          ).format();
        })
        .catch((error) => console.error("Error fetching weather: ", error));
      return res.status(200).json(weather);
    } catch (error) {
      return res.status(500).json({ message: `${JSON.stringify(error)}` });
    }
  };

  return {
    getTideTable,
    getTideChart,
    getWeatherForecast,
  };
};

module.exports = stationController;
