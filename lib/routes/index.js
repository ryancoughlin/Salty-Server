import tideTableRoute from './tide-table'
import tideChartRoute from './tide-chart'
import weatherRoute from './weather'
import stationRoute from './stations'
import waterTemperatureRoute from './water-temperature'
import swellRoute from './swell'
import scrapeRoute from './scrape'

const routes = [].concat(
  tideTableRoute,
  tideChartRoute,
  weatherRoute,
  stationRoute,
  waterTemperatureRoute,
  swellRoute,
  scrapeRoute
)

export default routes
