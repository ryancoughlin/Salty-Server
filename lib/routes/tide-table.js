import { findStation } from "../geo";
import { tideTable } from "../noaa";
import TideFormatter from "../tide-formatter";

const tideTableRoute = {
  method: "GET",
  path: "/api/tides",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    const tideTablePromise = findStation(
      longitude,
      latitude
    ).then(stationId => {
      return tideTable(stationId);
    });

    tideTablePromise
      .then(tides => {
        const tideFormatter = new TideFormatter(tides);

        reply({
          tables: tides,
          today: tideFormatter.todaysTides()
        });
      })
      .catch(e => console.log(e));
  }
};

export default tideTableRoute;
