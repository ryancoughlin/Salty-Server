import { findStation } from "../geo";
import { tideTable, fetchTides } from "../noaa";

const tideChartRoute = {
  method: "GET",
  path: "/api/tide-chart",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    const findStationPromise = findStation(
      longitude,
      latitude
    ).then(stationId => {
      return fetchTides(stationId, true);
    });

    findStationPromise
      .then(tideChart => {
        reply({
          ...tideChart
        });
      })
      .catch(e => console.log(e));
  }
};

export default tideChartRoute;
