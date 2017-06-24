import { findStation } from "../geo";
import NOAA from "../noaa-new";

const tideChartRoute = {
  method: "GET",
  path: "/api/tide-chart",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findStation(longitude, latitude).then(stationId => {
      const noaa = new NOAA(stationId);
      return noaa.fetchHourlyPredictions().then(hourlyPredictions => {
        reply({
          hourlyPredictions
        });
      });
    });
  }
};

export default tideChartRoute;
