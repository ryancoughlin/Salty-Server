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
    const tideTablePromise = findStation(longitude, latitude)
      .then(stationId => {
        const noaa = new NOAA(stationId);
        return noaa.fetchPredictions();
      })
      .catch(error => {
        console.log("ERROR FROM STATION PROMISE: ", error);
        reply({});
      });

    tideTablePromise
      .then(tides => {
        reply({
          tables: tides
        });
      })
      .catch(e => console.log(e));
  }
};

export default tideTableRoute;
