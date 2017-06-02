import tideTableRoute from "./tide-table";
import tideChartRoute from "./tide-chart";
import weatherRoute from "./weather";
import stationRoute from "./stations";

const routes = [].concat(
  tideTableRoute,
  tideChartRoute,
  weatherRoute,
  stationRoute
);

export default routes;
