import { findEnhancedStation } from "../geo";
import NOAA from "../noaa";

const waterTemperatureRoute = {
  method: "GET",
  path: "/api/water-temperature",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findEnhancedStation(longitude, latitude)
      .then(stationId => {
        const noaa = new NOAA(stationId);
        return noaa.fetchWaterTemperature().then(waterTemperatures => {
          reply(waterTemperatures);
        });
      })
      .catch(error => {
        console.log("ERROR:", error);
        reply({});
      });
  }
};

export default waterTemperatureRoute;
