import { findStation } from "../geo";
import TideFormatter from "../tide-formatter";
import NOAA from "../noaa-new";

const tideTableRoute = {
  method: "GET",
  path: "/api/tides",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    findStation(longitude, latitude)
      .then(stationId => {
        const NOAA = new NOAA(stationId);
        return NOAA.fetchPredictions().then(tides => {
          reply({
            tables: tides
            todaysTides: NOAA.findTodayTides(tides)
          });
        });
      })
      .catch(error => {
        console.log("ERROR FROM STATION PROMISE: ", error);
        reply({});
      });
  }
};

export default tideTableRoute;
