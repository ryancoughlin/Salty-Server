// Import the Buoy model and axios using ES6 import syntax
import Buoy from "../models/buoy.model";
import axios from "axios";
import { getBuoyData } from "../services/buoy-data-service";

const baseURL = "https://www.ndbc.noaa.gov/data/realtime2/";

const getClosestBuoy = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Missing latitude or longitude query parameters" });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      },
    };

    const buoy = await Buoy.findOne(query);

    if (!buoy) {
      return res.status(404).json({ error: "No nearby buoys found" });
    }

    // Once get a buoy, take the `id` and query NDBC for buoy data and return JSON
    const buoyData = await getBuoyData(44030);

    if (!buoyData) {
      return res.status(404).json({ error: "No data available for this buoy" });
    }

    res.json({ ...buoy.toObject(), buoyData });
  } catch (error) {
    console.error(`Error in getClosestBuoy: ${error}`);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

// Use ES6 export syntax
export { getClosestBuoy };
