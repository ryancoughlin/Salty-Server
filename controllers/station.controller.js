// controllers/station.controller.js
const {
  fetchClosestStation,
  fetchAllStations,
  fetchStationById,
} = require("../services/stationService");
const createTideFetcher = require("../TideData");
const { formatStation, handleError } = require("../utils");
const { query, param, validationResult } = require("express-validator");

const getAllStations = async (req, res) => {
  try {
    const stations = await fetchAllStations();
    const formattedStations = stations.map(formatStation);
    res.json(formattedStations);
  } catch (error) {
    handleError(error, res, "Error fetching all stations");
  }
};

const getClosestStation = [
  query("latitude").isFloat().withMessage("Latitude must be a number"),
  query("longitude").isFloat().withMessage("Longitude must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { latitude, longitude } = req.query;
      const station = await fetchClosestStation(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      if (!station) {
        return res.status(404).json({ error: "No nearby stations found" });
      }

      const tideData = await fetchTideDataForStation(station);
      res.json(tideData);
    } catch (error) {
      handleError(error, res, "Error fetching closest station");
    }
  },
];

const getStationData = [
  param("stationId").isString().withMessage("Station ID must be a string"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { stationId } = req.params;
      const station = await fetchStationById(stationId);

      if (!station) {
        return res.status(404).json({ error: "Station not found" });
      }

      const tideData = await fetchTideDataForStation(station);
      res.json(tideData);
    } catch (error) {
      handleError(error, res, "Error fetching tide data for station");
    }
  },
];

// Unified function to fetch tide data for a station
const fetchTideDataForStation = async (station) => {
  const tideDataFetcher = createTideFetcher(station);
  const tideData = await tideDataFetcher.fetchData();

  let referenceTideData = null;
  if (station.station_type === "subordinate" && station.referenceId) {
    const referenceStation = await fetchStationById(station.referenceId);
    if (referenceStation) {
      const referenceTideDataFetcher = createTideFetcher(
        referenceStation,
        "30"
      );
      referenceTideData = await referenceTideDataFetcher.fetchData();
    }
  }

  return {
    ...formatStation(station),
    tides: tideData,
    referenceTides: referenceTideData,
  };
};

module.exports = {
  getAllStations,
  getClosestStation,
  getStationData,
};
