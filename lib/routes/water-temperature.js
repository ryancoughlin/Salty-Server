import { findStation, findEnhancedStation } from "../geo";
import { fetchWaterTemperature } from "../noaa";
import TideFormatter from "../tide-formatter";

const waterTemperatureRoute = {
  method: "GET",
  path: "/api/water-temperature",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findEnhancedStation(longitude, latitude)
      .then(stationId => {
        console.log("Station id is: ", stationId);
        return fetchWaterTemperature(stationId);
      })
      .catch(error => {
        console.log("ERROR:", error);
        reply({});
      });
  }
};

export default waterTemperatureRoute;
