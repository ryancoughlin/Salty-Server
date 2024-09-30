// services/stationService.js
const connectDB = require("../database");
const Spot = require("../models/spot.model");
const sanitize = require("mongo-sanitize");

const fetchClosestStation = async (lat, lon) => {
  await connectDB();
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [sanitize(lon), sanitize(lat)],
        },
        $maxDistance: 100000, // Adjust the distance as needed
      },
    },
  };

  return await Spot.findOne(query);
};

const fetchAllStations = async () => {
  await connectDB();
  return await Spot.find({});
};

const fetchStationById = async (stationId) => {
  await connectDB();
  const query = { id: sanitize(stationId) };
  console.log("Executing fetchStationById query:", query);
  return await Spot.findOne(query);
};

module.exports = { fetchClosestStation, fetchAllStations, fetchStationById };
