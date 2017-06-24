import tideTableRoute from "./tide-table";
import tideChartRoute from "./tide-chart";
import weatherRoute from "./weather";
import stationRoute from "./stations";
import waterTemperatureRoute from "./water-temperature";

const routes = [].concat(
  tideTableRoute,
  tideChartRoute,
  weatherRoute,
  stationRoute,
  waterTemperatureRoute
);

export default routes;
