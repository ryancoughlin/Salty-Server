import tideTableRoute from './tide-table'
import tideChartRoute from './tide-chart'
import weatherRoute from './weather'
import stationRoute from './stations'
import waterTemperatureRoute from './water-temperature'
import swellRoute from './swell'
import nearbyStationsRoute from './nearby-stations'

const routes = [].concat(
  tideTableRoute,
  tideChartRoute,
  weatherRoute,
  stationRoute,
  waterTemperatureRoute,
  swellRoute,
  nearbyStationsRoute
)

export default routes
